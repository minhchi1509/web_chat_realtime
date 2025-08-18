import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes
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

import {
  SOCKET_EVENTS_NAME_TO_CLIENT,
  SUBSCRIBED_SOCKET_EVENTS_NAME
} from 'src/common/constants/socket-events.constant';
import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { WsExceptionFilter } from 'src/common/filters/ws-exception-filter';
import { SocketAuthGuard } from 'src/common/guards/socket-auth.guard';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { WebSocketMiddleware } from 'src/common/middlewares/websocket.middleware';
import { WebSocketValidationPipe } from 'src/common/pipes/websocket-validation.pipe';
import { TJWTPayload } from 'src/common/types/token.type';
import { RedisService } from 'src/modules/libs/redis/redis.service';
import { ChatSocketService } from 'src/modules/web-socket/chat/chat-socket.service';
import { MarkSeenMessageBodyDTO } from 'src/modules/web-socket/chat/dto/mark-seen-message/MarkSeenMessageBody.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: ['http://localhost:3000', 'https://web-chat.minhchi.id.vn'],
    credentials: true
  }
})
@UseFilters(AllExceptionsFilter, WsExceptionFilter)
@UseInterceptors(LoggingInterceptor)
@UseGuards(SocketAuthGuard)
@UsePipes(WebSocketValidationPipe)
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => ChatSocketService))
    private chatSocketService: ChatSocketService,
    private websocketMiddleware: WebSocketMiddleware,
    private redisService: RedisService
  ) {}

  async afterInit() {
    await this.redisService.deleteAllSocketId();
    this.server.use((client, next) => {
      this.websocketMiddleware.verifyClient(client, next);
    });
    this.logger.log('🚀 ChatGateway was established succesfully!');
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

  @SubscribeMessage(SUBSCRIBED_SOCKET_EVENTS_NAME.CHAT.USER_MARK_SEEN_MESSAGE)
  async markSeenMessage(client: Socket, data: MarkSeenMessageBodyDTO) {
    const { sub: userId } = client.handshake.auth as TJWTPayload;
    if (userId && data.conversationId) {
      await this.chatSocketService.markSeenLatestMessageOfConversation(
        data.conversationId,
        userId
      );
    }
  }
}
