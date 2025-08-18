import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { ESortType } from 'src/common/constants/common.enum';
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
        where: { conversationId, leftAt: null },
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
    const _userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    const lastMessageOfConversation =
      await this.prismaService.message.findFirst({
        where: {
          conversationId
        },
        orderBy: {
          createdAt: ESortType.DESC
        }
      });

    if (!lastMessageOfConversation) {
      return;
    }

    await this.prismaService.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId
      },
      data: {
        lastSeenMessageId: lastMessageOfConversation.id,
        lastSeenMessageAt: new Date()
      }
    });

    await this.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.CONVERSATION_DETAIL_UPDATED,
      { userId, conversationId }
    );
  }
}
