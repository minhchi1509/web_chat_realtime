import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { SOCKET_EVENTS_NAME_TO_CLIENT } from 'src/common/constants/socket-events.constant';
import { RedisService } from 'src/modules/libs/redis/redis.service';
import { ChatGateway } from 'src/modules/web-socket/chat/chat.gateway';

@Injectable()
export class ChatSocketService {
  constructor(
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private redisService: RedisService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway
  ) {}

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
    this.chatGateway.server.to(allMembersSocketIds).emit(eventName, data);
  }

  async markSeenLatestMessageOfConversation(
    conversationId: string,
    userId: string
  ) {
    const conversation = await this.prismaService.conversation
      .findFirstOrThrow({
        where: {
          id: conversationId,
          conversationParticipants: {
            some: {
              userId
            }
          }
        },
        select: {
          messages: {
            where: {
              isLastMessageOfConversation: true
            },
            select: {
              id: true
            }
          }
        }
      })
      .catch(() => {
        throw new WsException('Conversation not found');
      });

    await this.prismaService.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId
      },
      data: {
        lastSeenMessageId: conversation.messages[0]?.id,
        lastSeenMessageAt: new Date()
      }
    });

    await this.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.NEW_USER_SEEN_MESSAGE,
      { userId, conversationId }
    );
  }
}
