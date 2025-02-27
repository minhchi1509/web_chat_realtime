import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UseFilters
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import {
  SOCKET_EVENTS_NAME_TO_CLIENT,
  SUBSCRIBED_SOCKET_EVENTS_NAME
} from 'src/common/constants/socket-events.constant';
import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { WebSocketMiddleware } from 'src/common/middlewares/websocket.middleware';
import { TJWTPayload } from 'src/common/types/token.type';
import { ChatService } from 'src/modules/apis/chat/chat.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
@UseFilters(AllExceptionsFilter)
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer() server: Server;

  constructor(
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private redisService: RedisService,
    private websocketMiddleware: WebSocketMiddleware,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService
  ) {}

  async afterInit() {
    await this.redisService.deleteAllSocketId();
    this.logger.log('🚀 ChatGateway was established succesfully!');
    this.server.use((client, next) => {
      this.websocketMiddleware.verifyClient(client, next);
    });
  }

  async handleConnection(client: Socket) {
    const { sub: userId } = client.handshake.auth as TJWTPayload;
    await this.redisService.setUserSocketId(userId, client.id);
    this.server.emit(SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.USER_ACTIVITY_STATUS, {
      userId
    });
  }

  async handleDisconnect(client: Socket) {
    const { sub: userId } = client.handshake.auth as TJWTPayload;
    await this.redisService.deleteUserSocketId(userId, client.id);
    this.server.emit(SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.USER_ACTIVITY_STATUS, {
      userId
    });
  }

  async sendNotificationToConversationMembers(
    conversationId: string,
    eventName: string,
    data?: any
  ) {
    const conversationMembers =
      await this.prismaService.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true }
      });
    const allMembersSocketIds = (
      await Promise.all(
        conversationMembers.map(async ({ userId }) => {
          const socketId = await this.redisService.getUserSocketId(userId);
          return socketId;
        })
      )
    ).reduce((acc, socketId) => {
      return acc.concat(socketId);
    }, []);
    this.server.to(allMembersSocketIds).emit(eventName, data);
  }

  @SubscribeMessage(SUBSCRIBED_SOCKET_EVENTS_NAME.CHAT.USER_MARK_SEEN_MESSAGE)
  async markSeenMessage(
    client: Socket,
    { conversationId }: { conversationId: string }
  ) {
    const { sub: userId } = client.handshake.auth as TJWTPayload;
    if (userId && conversationId) {
      await this.chatService.markSeenLatestMessageOfConversation(
        conversationId,
        userId
      );
    }
  }
}
