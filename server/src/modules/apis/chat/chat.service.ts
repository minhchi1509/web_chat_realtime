import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { MessageEmotionType, MessageMediaType } from '@prisma/client';
import dayjs from 'dayjs';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { ESortType } from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { SOCKET_EVENTS_NAME_TO_CLIENT } from 'src/common/constants/socket-events.constant';
import { PaginationQueryDTO } from 'src/common/dto/PaginationQuery.dto';
import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';
import { getMediaType } from 'src/common/utils/common.util';
import { CreatePrivateChatResponseDTO } from 'src/modules/apis/chat/dto/create-private-chat/CreatePrivateChatResponse.dto';
import { DropMessageEmotionResponseDTO } from 'src/modules/apis/chat/dto/drop-message-emotion/DropMessageEmotionResponse.dto';
import { GetChatMemberResponseDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMemberResponse.dto';
import { GetChatMembersQueryDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMembersQuery.dto';
import { GetConversationDetailsResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-details/GetConversationDetailsResponse.dto';
import { GetConversationMessageResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-messages/GetConversationMessageResponse.dto';
import { GetConversationResponseDTO } from 'src/modules/apis/chat/dto/get-conversations/GetConversationResponse.dto';
import { SendConversationMessageDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageBody.dto';
import { SendConversationMessageResponseDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageResponse.dto';
import { CloudinaryService } from 'src/modules/libs/cloudinary/cloudinary.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';
import { ChatSocketService } from 'src/modules/web-socket/chat/chat-socket.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private redisService: RedisService,
    private cloudinaryService: CloudinaryService,
    private chatSocketService: ChatSocketService
  ) {}

  async getChatMembers(
    userId: string,
    query: GetChatMembersQueryDTO
  ): Promise<PaginationResponseDTO<GetChatMemberResponseDTO>> {
    const [chatMembers, pagination] = await this.prismaService.user
      .paginate({
        where: {
          OR: [
            {
              fullName: {
                contains: query.searchKey
              }
            },
            {
              email: {
                equals: query.searchKey
              }
            }
          ],
          id: {
            not: userId
          }
        }
      })
      .withPages({
        page: query.page,
        limit: query.pageSize,
        includePageCount: true
      });
    return {
      currentPage: pagination.currentPage,
      pageSize: query.pageSize,
      totalPage: pagination.pageCount,
      hasNextPage: !!pagination.nextPage,
      data: await Promise.all(
        chatMembers.map(async (chatMember) => ({
          profile: { ...chatMember },
          isOnline:
            (await this.redisService.getUserSocketId(chatMember.id)).length > 0
        }))
      )
    };
  }

  async createPrivateChat(
    userId: string,
    receiverId: string
  ): Promise<CreatePrivateChatResponseDTO> {
    if (userId === receiverId) {
      throw new BadRequestException('You cannot create chat with yourself');
    }

    const existingConversation =
      await this.prismaService.conversation.findFirst({
        where: {
          conversationParticipants: {
            every: {
              userId: {
                in: [userId, receiverId]
              }
            }
          },
          isGroupChat: false
        }
      });

    if (existingConversation) {
      return {
        message: 'Private chat created successfully',
        createdConversation: existingConversation
      };
    }

    const _receiver = await this.prismaService.user
      .findUniqueOrThrow({
        where: { id: receiverId }
      })
      .catch(() => {
        throw new NotFoundException('Received user not found');
      });

    const createdConversation = await this.prismaService.conversation.create({
      data: {
        conversationParticipants: {
          createMany: {
            data: [{ userId }, { userId: receiverId }]
          }
        }
      }
    });
    return {
      message: 'Private chat created successfully',
      createdConversation
    };
  }

  async getUserConversations(
    query: PaginationQueryDTO,
    currentUserId: string
  ): Promise<PaginationResponseDTO<GetConversationResponseDTO>> {
    const [conversations, pagination] = await this.prismaService.conversation
      .paginate({
        where: {
          conversationParticipants: {
            some: {
              userId: currentUserId
            }
          },
          messages: {
            some: {
              isLastMessageOfConversation: true
            }
          }
        },
        include: {
          conversationParticipants: {
            select: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: ESortType.DESC
        }
      })
      .withPages({
        page: query.page,
        limit: query.pageSize,
        includePageCount: true
      });

    const getLastMessageResponseByConversation = async (
      conversationId: string
    ) => {
      const lastMessage = await this.prismaService.message.findFirst({
        where: {
          conversationId,
          isLastMessageOfConversation: true
        },
        include: {
          sender: {
            include: {
              user: true
            }
          },
          lastSeenBy: {
            select: {
              userId: true
            }
          },
          conversation: {
            select: {
              isGroupChat: true
            }
          },
          _count: {
            select: {
              messageMedias: true
            }
          }
        }
      });

      if (!lastMessage) {
        throw new Error('Last message not found');
      }

      const isMessageSentByCurrentUser =
        lastMessage.sender.userId === currentUserId;
      const isGroupChat = lastMessage.conversation.isGroupChat;
      const totalMedia = lastMessage._count.messageMedias;
      const previewContent = lastMessage.content
        ? lastMessage.content
        : `sent ${totalMedia} media`;
      const displaySender = isMessageSentByCurrentUser
        ? 'You: '
        : isGroupChat
          ? `${lastMessage.sender.user.fullName.split(' ')[0]}: `
          : '';

      return {
        id: lastMessage.id,
        sender: lastMessage.sender,
        isSeen: lastMessage.lastSeenBy.some(
          (lastSeenBy) => lastSeenBy.userId === currentUserId
        ),
        createdAt: lastMessage.createdAt,
        previewContent: `${displaySender}${previewContent}`
          .toLowerCase()
          .replace(/^\s*\w/, (char) => char.toUpperCase())
      };
    };

    const responseData = await Promise.all(
      conversations.map(
        async (conversation): Promise<GetConversationResponseDTO> => {
          const lastMessage = await getLastMessageResponseByConversation(
            conversation.id
          );
          const partner = conversation.conversationParticipants.find(
            (participant) => participant.user.id !== currentUserId
          );
          if (!partner) {
            throw new Error('Partner not found');
          }
          const isOnline = conversation.isGroupChat
            ? false
            : (await this.redisService.getUserSocketId(partner.user.id))
                .length > 0;

          return {
            id: conversation.id,
            name: conversation.name || partner.user.fullName,
            thumbnail: conversation.thumbnail || partner.user.avatar,
            isGroupChat: conversation.isGroupChat,
            isOnline,
            createdAt: conversation.createdAt,
            lastMessage: {
              id: lastMessage.id,
              sender: {
                id: lastMessage.sender.userId,
                profile: lastMessage.sender.user,
                role: lastMessage.sender.role
              },
              isSeen: lastMessage.isSeen,
              createdAt: lastMessage.createdAt,
              previewContent: lastMessage.previewContent
            }
          };
        }
      )
    );
    return {
      currentPage: pagination.currentPage,
      pageSize: query.pageSize,
      totalPage: pagination.pageCount,
      hasNextPage: !!pagination.nextPage,
      data: responseData
    };
  }

  sendConversationMessage = async (
    conversationId: string,
    userId: string,
    body: SendConversationMessageDTO
  ): Promise<SendConversationMessageResponseDTO> => {
    const { messageFiles, content } = body;

    if (!content && (!messageFiles || messageFiles.length === 0)) {
      throw new BadRequestException('Message content or media is required');
    }

    const conversation = await this.prismaService.conversation
      .findUniqueOrThrow({
        where: {
          id: conversationId
        },
        select: {
          conversationParticipants: {
            where: {
              userId
            },
            select: {
              id: true
            }
          }
        }
      })
      .catch(() => {
        throw new NotFoundException('Conversation not found');
      });

    const currentConversationParticipantId =
      conversation.conversationParticipants[0]?.id;
    if (!currentConversationParticipantId) {
      throw new Error('Current conversation participant not found');
    }

    let messageMedias: {
      mediaType: MessageMediaType;
      url: string;
      fileName: string | null;
    }[] = [];
    if (messageFiles) {
      messageMedias = await Promise.all(
        messageFiles.map(async (messageFile) => {
          const { mimetype } = messageFile;
          const mediaType = getMediaType(mimetype);
          const uploadedFile = await this.cloudinaryService.uploadFile(
            messageFile,
            {
              folder: 'message-media',
              resource_type: 'auto'
            }
          );

          return {
            mediaType,
            url: uploadedFile.secure_url,
            fileName:
              mediaType === MessageMediaType.FILE
                ? messageFile.originalName
                : null
          };
        })
      );
    }

    const currentLastMessage = await this.prismaService.message.findFirst({
      where: {
        conversationId,
        isLastMessageOfConversation: true
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    const createdMessage = await this.prismaService.message.create({
      data: {
        senderId: currentConversationParticipantId,
        conversationId,
        content,
        isShowSeperateTime: currentLastMessage
          ? dayjs().diff(
              dayjs(currentLastMessage.createdAt || new Date()),
              'minute'
            ) >= 10
          : true,
        ...(messageMedias.length > 0 && {
          messageMedias: {
            createMany: {
              data: messageMedias.map((media) => ({
                type: media.mediaType,
                url: media.url,
                fileName: media.fileName
              }))
            }
          }
        }),
        isLastMessageOfConversation: true
      },
      include: {
        sender: {
          include: {
            user: true
          }
        },
        messageMedias: true
      }
    });

    if (currentLastMessage) {
      await this.prismaService.message.update({
        where: {
          id: currentLastMessage.id
        },
        data: {
          isLastMessageOfConversation: false
        }
      });
    }

    // Cập nhật last seen message của người dùng
    await this.prismaService.conversationParticipant.update({
      where: {
        id: currentConversationParticipantId
      },
      data: {
        lastSeenMessageId: createdMessage.id,
        lastSeenMessageAt: new Date()
      }
    });

    await this.prismaService.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date()
      }
    });

    await this.chatSocketService.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.NEW_CONVERSATION_MESSAGE,
      { conversationId }
    );

    return {
      message: 'Message sent successfully',
      sentMessage: {
        id: createdMessage.id,
        sender: {
          id: createdMessage.sender.id,
          profile: {
            ...createdMessage.sender.user
          },
          role: createdMessage.sender.role
        },
        content: createdMessage.content,
        mediaList: createdMessage.messageMedias.map((messageMedia) => ({
          id: messageMedia.id,
          url: messageMedia.url,
          type: messageMedia.type,
          fileName: messageMedia.fileName
        })),
        emotions: [],
        createdAt: createdMessage.createdAt,
        isLastMessageOfConversation: createdMessage.isLastMessageOfConversation
      }
    };
  };

  async getConversationMessages(
    conversationId: string,
    query: PaginationQueryDTO,
    userId: string
  ): Promise<PaginationResponseDTO<GetConversationMessageResponseDTO>> {
    const [messages, pagination] = await this.prismaService.message
      .paginate({
        where: {
          conversationId
        },
        include: {
          sender: {
            include: {
              user: true
            }
          },
          lastSeenBy: {
            include: {
              user: true
            }
          },
          messageMedias: true,
          messageEmotions: {
            include: {
              participant: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: ESortType.DESC
        }
      })
      .withPages({
        page: query.page,
        limit: query.pageSize,
        includePageCount: true
      });

    const paginatedData: GetConversationMessageResponseDTO[] = messages.map(
      (m) => ({
        id: m.id,
        sender: {
          id: m.sender.id,
          profile: m.sender.user,
          role: m.sender.role
        },
        content: m.content,
        mediaList: m.messageMedias,
        emotions: m.messageEmotions.map((emotion) => ({
          id: emotion.id,
          type: emotion.type,
          participant: {
            id: emotion.participant.id,
            profile: emotion.participant.user,
            role: emotion.participant.role
          },
          createdAt: emotion.createdAt
        })),
        createdAt: m.createdAt,
        isLastMessageOfConversation: m.isLastMessageOfConversation,
        isShowSeperateTime: m.isShowSeperateTime,
        seenBy: m.lastSeenBy
          .filter((v) => v.userId !== userId)
          .map((seenParticipant) => ({
            id: seenParticipant.id,
            profile: seenParticipant.user,
            role: seenParticipant.role,
            seenAt: seenParticipant.lastSeenMessageAt || new Date()
          }))
      })
    );

    return {
      currentPage: pagination.currentPage,
      pageSize: query.pageSize,
      totalPage: pagination.pageCount,
      hasNextPage: !!pagination.nextPage,
      data: paginatedData
    };
  }

  async getConversationDetails(
    conversationId: string,
    userId: string
  ): Promise<GetConversationDetailsResponseDTO> {
    const conversation = await this.prismaService.conversation
      .findUniqueOrThrow({
        where: {
          id: conversationId
        },
        include: {
          conversationParticipants: {
            where: {
              userId: {
                not: userId
              }
            },
            select: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true
                }
              }
            }
          }
        }
      })
      .catch(() => {
        throw new NotFoundException('Conversation not found');
      });
    const partner = conversation.conversationParticipants[0];

    if (!partner) {
      throw new Error('Partner not found');
    }

    const isPartnerOnline =
      (await this.redisService.getUserSocketId(partner.user.id)).length > 0;
    return {
      ...conversation,
      name: conversation.name || partner.user.fullName,
      thumbnail: conversation.thumbnail || partner.user.avatar,
      isOnline: conversation.isGroupChat ? false : isPartnerOnline
    };
  }

  async dropMessageEmotion(
    conversationId: string,
    messageId: string,
    userId: string,
    emotionType: MessageEmotionType
  ): Promise<DropMessageEmotionResponseDTO> {
    // Find the message and check if it exists
    const message = await this.prismaService.message
      .findUniqueOrThrow({
        where: {
          id: messageId,
          conversationId
        },
        include: {
          conversation: {
            include: {
              conversationParticipants: {
                where: {
                  userId
                }
              }
            }
          }
        }
      })
      .catch(() => {
        throw new NotFoundException('Message not found');
      });

    // Safely get the participant ID
    const participant = message.conversation.conversationParticipants[0];
    if (!participant) {
      throw new Error('Participant not found');
    }
    const participantId = participant.id;

    // Check if an emotion already exists for this participant and message
    const existingEmotion = await this.prismaService.messageEmotion.findUnique({
      where: {
        messageId_participantId: {
          messageId,
          participantId
        }
      },
      include: {
        participant: {
          include: {
            user: true
          }
        }
      }
    });

    let result: DropMessageEmotionResponseDTO;

    if (existingEmotion) {
      // Update existing emotion if type is different
      if (existingEmotion.type !== emotionType) {
        const updatedEmotion = await this.prismaService.messageEmotion.update({
          where: {
            id: existingEmotion.id
          },
          data: {
            type: emotionType
          },
          include: {
            participant: {
              include: {
                user: true
              }
            }
          }
        });

        result = {
          message: 'Message emotion updated successfully',
          droppedEmotion: {
            id: updatedEmotion.id,
            type: updatedEmotion.type,
            participant: {
              id: updatedEmotion.participant.id,
              profile: updatedEmotion.participant.user,
              role: updatedEmotion.participant.role
            },
            createdAt: updatedEmotion.createdAt
          }
        };
      } else {
        // Remove emotion if the same type is selected
        await this.prismaService.messageEmotion.delete({
          where: {
            id: existingEmotion.id
          }
        });

        result = {
          message: 'Message emotion removed successfully',
          droppedEmotion: {
            id: existingEmotion.id,
            type: existingEmotion.type,
            participant: {
              id: existingEmotion.participant.id,
              profile: existingEmotion.participant.user,
              role: existingEmotion.participant.role
            },
            createdAt: existingEmotion.createdAt
          }
        };
      }
    } else {
      // Create a new emotion
      const newEmotion = await this.prismaService.messageEmotion.create({
        data: {
          type: emotionType,
          messageId,
          participantId
        },
        include: {
          participant: {
            include: {
              user: true
            }
          }
        }
      });

      result = {
        message: 'Dropped message emotion successfully',
        droppedEmotion: {
          id: newEmotion.id,
          type: newEmotion.type,
          participant: {
            id: newEmotion.participant.id,
            profile: newEmotion.participant.user,
            role: newEmotion.participant.role
          },
          createdAt: newEmotion.createdAt
        }
      };
    }

    await this.chatSocketService.sendNotificationToConversationMembers(
      message.conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.NEW_MESSAGE_EMOTION,
      { conversationId }
    );

    return result;
  }
}
