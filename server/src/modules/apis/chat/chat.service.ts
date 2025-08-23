import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  Conversation,
  Message,
  MessageMediaType,
  MessageType
} from '@prisma/client';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { ESortType } from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { PaginationQueryDTO } from 'src/common/dto/PaginationQuery.dto';
import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';
import {
  containsOnlyEmojiOrWhitespace,
  extractUrl,
  getEmojiDisplayUrl,
  getMediaType
} from 'src/common/utils/common.util';
import { formatMessageReactions } from 'src/common/utils/message.util';
import { CreatedPrivateChatResponseDTO } from 'src/modules/apis/chat/dto/create-private-chat/CreatedPrivateChatResponse.dto';
import { GetChatMemberResponseDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMemberResponse.dto';
import { GetChatMembersQueryDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMembersQuery.dto';
import { GetConversationDetailsResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-details/GetConversationDetailsResponse.dto';
import {
  ActionsOnMessageDTO,
  GetConversationMessageResponseDTO,
  LinkMetadata
} from 'src/modules/apis/chat/dto/get-conversation-messages/GetConversationMessageResponse.dto';
import { GetConversationResponseDTO } from 'src/modules/apis/chat/dto/get-conversations/GetConversationResponse.dto';
import { SendConversationMessageDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageBody.dto';
import { CloudinaryService } from 'src/modules/libs/cloudinary/cloudinary.service';
import { CloudinaryQueueService } from 'src/modules/libs/job-queue/cloudinary-queue/providers/cloudinary-queue.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private redisService: RedisService,
    private cloudinaryService: CloudinaryService,
    private cloudinaryQueueService: CloudinaryQueueService
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
  ): Promise<CreatedPrivateChatResponseDTO> {
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
        createdConversationId: existingConversation.id
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
      createdConversationId: createdConversation.id
    };
  }

  getLastMessageResponseByConversation = async (
    conversation: Conversation & {
      conversationParticipants: Array<{
        userId: string;
        user: { fullName: string };
      }>;
    },
    userId: string
  ) => {
    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversation.id,
        userId
      );
    // Find the last message not deleted by current user
    const lastMessage = await this.prismaService.message.findFirst({
      where: {
        conversationId: conversation.id,
        deletedBy: {
          none: {
            participantId: userParticipantId
          }
        }
      },
      orderBy: {
        createdAt: ESortType.DESC
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
        messageMedias: {
          select: {
            type: true,
            fileName: true
          }
        },
        systemActionDetail: {
          include: {
            actor: {
              include: {
                user: true
              }
            },
            target: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!lastMessage) {
      return undefined;
    }

    // Prepare preview content based on message type
    const isMessageSentByCurrentUser = lastMessage.sender?.userId === userId;
    const isGroupChat = lastMessage.conversation.isGroupChat;
    let previewContent = '';

    const senderFullName = isMessageSentByCurrentUser
      ? 'You'
      : lastMessage.sender?.user.fullName || 'Unknown';

    // Handle different message types
    if (lastMessage.isRevokedForEveryone) {
      previewContent = `${senderFullName} unsent a message`;
    } else {
      switch (lastMessage.type) {
        case MessageType.TEXT:
          previewContent = `${senderFullName}: ${lastMessage.content}`;
          break;

        case MessageType.ICON:
          previewContent = `${senderFullName}: ${lastMessage.content}`;
          break;

        case MessageType.MEDIA: {
          const photoCount = lastMessage.messageMedias.filter(
            (media) => media.type === MessageMediaType.PHOTO
          ).length;

          if (photoCount > 0) {
            previewContent = `${senderFullName} sent ${photoCount} photo${photoCount > 1 ? 's' : ''}.`;
          } else {
            const mediaType = lastMessage.messageMedias[0]?.type;
            switch (mediaType) {
              case MessageMediaType.VIDEO:
                previewContent = `${senderFullName} sent a video.`;
                break;
              case MessageMediaType.AUDIO:
                previewContent = `${senderFullName} sent an audio clip.`;
                break;
              case MessageMediaType.FILE:
                previewContent = `${senderFullName} sent an attachment.`;
                break;
              default:
                previewContent = `${senderFullName} sent media.`;
            }
          }
          break;
        }

        case MessageType.SYSTEM: {
          if (!lastMessage.systemActionDetail) {
            previewContent = `System message`;
            break;
          }

          const actorName =
            lastMessage.systemActionDetail.actor.userId === userId
              ? 'You'
              : lastMessage.systemActionDetail.actor.user.fullName;

          switch (lastMessage.systemAction) {
            case 'CHANGE_BACKGROUND':
              previewContent = `${actorName} changed the theme to ${lastMessage.systemActionDetail.newValue}`;
              break;

            case 'ADD_MEMBER':
              if (lastMessage.systemActionDetail.target) {
                previewContent = `${actorName} added ${lastMessage.systemActionDetail.target.user.fullName} to the group`;
              }
              break;

            case 'REMOVE_MEMBER':
              if (lastMessage.systemActionDetail.target) {
                previewContent = `${actorName} removed ${lastMessage.systemActionDetail.target.user.fullName} from the group`;
              }
              break;

            case 'CHANGE_CONVERSATION_NAME':
              previewContent = `${actorName} changed the group name to ${lastMessage.systemActionDetail.newValue}`;
              break;

            case 'LEAVE_CONVERSATION':
              previewContent = `${actorName} left the group`;
              break;

            case 'CHANGE_EMOTICONS':
              previewContent = `${actorName} changed the conversation emoticons`;
              break;

            default:
              previewContent = `System action occurred`;
          }
          break;
        }

        case MessageType.CALL: {
          // Call only for private conversations
          if (!isGroupChat) {
            const partner = conversation.conversationParticipants?.find(
              (p) => p.userId !== userId
            );
            const partnerFullName = partner?.user.fullName || 'Unknown';

            if (lastMessage.callStatus === 'MISSED') {
              if (isMessageSentByCurrentUser) {
                previewContent = `${partnerFullName} missed your call`;
              } else {
                previewContent = `You missed a video call with ${partnerFullName}`;
              }
            } else if (lastMessage.callStatus === 'ENDED') {
              previewContent = `The video call ended`;
            }
          }
          break;
        }

        default:
          previewContent = `Message received`;
      }
    }

    return {
      id: lastMessage.id,
      isSeen: lastMessage.lastSeenBy.some(
        (lastSeenBy) => lastSeenBy.userId === userId
      ),
      createdAt: lastMessage.createdAt,
      previewContent: previewContent.replace(/^\s*\w/, (char) =>
        char.toUpperCase()
      )
    };
  };

  async getUserConversations(
    query: PaginationQueryDTO,
    currentUserId: string
  ): Promise<PaginationResponseDTO<GetConversationResponseDTO>> {
    // Fetch conversations where user is a participant and there's at least one message
    const [conversations, pagination] = await this.prismaService.conversation
      .paginate({
        where: {
          conversationParticipants: {
            some: {
              userId: currentUserId,
              leftAt: null
            }
          },
          messages: {
            some: {}
          }
        },
        include: {
          conversationParticipants: {
            include: {
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

    const responseData = await Promise.all(
      conversations.map(
        async (c): Promise<GetConversationResponseDTO | undefined> => {
          const lastUserDeleteConversationAt = c.conversationParticipants.find(
            (cp) => cp.userId === currentUserId
          )?.lastDeleteConversationAt;

          if (
            lastUserDeleteConversationAt &&
            lastUserDeleteConversationAt > c.updatedAt
          ) {
            return undefined;
          }

          const lastMessage = await this.getLastMessageResponseByConversation(
            c,
            currentUserId
          );

          if (!lastMessage) {
            return undefined;
          }

          const partner = c.conversationParticipants.find(
            (participant) => participant.userId !== currentUserId
          );

          if (!partner) {
            throw new Error('Partner not found');
          }

          const isOnline = c.isGroupChat
            ? false
            : (await this.redisService.getUserSocketId(partner.userId)).length >
              0;

          return {
            id: c.id,
            name: c.name || partner.user.fullName,
            thumbnail: c.thumbnail || partner.user.avatar,
            isGroupChat: c.isGroupChat,
            isOnline,
            createdAt: c.createdAt,
            lastMessage
          };
        }
      )
    );

    const successfulResponseData = responseData.filter((r) => r !== undefined);

    return {
      currentPage: pagination.currentPage,
      pageSize: query.pageSize,
      totalPage: pagination.pageCount,
      hasNextPage: !!pagination.nextPage,
      data: successfulResponseData
    };
  }

  validateActionOnMessage = async (
    message: Message,
    userParticipantId: string
  ) => {
    // Nếu message bị thu hồi hoặc là message hệ thống hoặc cuộc gọi
    if (
      message.isRevokedForEveryone ||
      message.type === MessageType.SYSTEM ||
      message.type === MessageType.CALL
    ) {
      throw new ForbiddenException('You can not perform this action');
    }

    //Người dùng không thể thực hiện hành động trên tin nhắn mà họ đã xóa bên họ
    const deletedMessage = await this.prismaService.deletedMessage.findUnique({
      where: {
        messageId_participantId: {
          messageId: message.id,
          participantId: userParticipantId
        }
      }
    });
    if (deletedMessage) {
      throw new ForbiddenException('You can not perform this action');
    }
  };

  sendConversationMessage = async (
    conversationId: string,
    parentMessageId: string | undefined,
    userId: string,
    body: SendConversationMessageDTO
  ): Promise<MessageResponseDTO> => {
    const { messageFiles, content } = body;

    if (!content && (!messageFiles || messageFiles.length === 0)) {
      throw new BadRequestException('Message content or media is required');
    }

    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    if (parentMessageId) {
      // Kiểm tra sự tồn tại của message đang cần reply
      const parentMessage = await this.prismaService.message
        .findUniqueOrThrow({
          where: { id: parentMessageId }
        })
        .catch(() => {
          throw new NotFoundException('Parent message not found');
        });

      await this.validateActionOnMessage(parentMessage, userParticipantId);
    }

    // Process uploaded files
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

    // Determine message type based on content
    let messageType: MessageType = MessageType.TEXT;
    // Check if content contains only spaces or emojis
    if (content) {
      const isHasOnlySpacesOrEmojis = containsOnlyEmojiOrWhitespace(content);
      messageType = isHasOnlySpacesOrEmojis
        ? MessageType.ICON
        : MessageType.TEXT;
    }

    // Group media by type for message creation
    const photoMedias = messageMedias.filter(
      (media) => media.mediaType === MessageMediaType.PHOTO
    );

    const nonPhotoMedias = messageMedias.filter(
      (media) => media.mediaType !== MessageMediaType.PHOTO
    );

    // Array to store created messages
    const createdMessages = [];

    // Create photo message if there are photos (all photos in one message)
    if (photoMedias.length > 0) {
      const photoMessage = await this.prismaService.message.create({
        data: {
          senderId: userParticipantId,
          conversationId,
          type: MessageType.MEDIA,
          content: null,
          replyToMessageId: parentMessageId || null,
          messageMedias: {
            createMany: {
              data: photoMedias.map((media) => ({
                type: media.mediaType,
                url: media.url,
                fileName: media.fileName
              }))
            }
          }
        }
      });
      createdMessages.push(photoMessage);
    }

    // Create separate messages for each non-photo media
    for (const media of nonPhotoMedias) {
      const mediaMessage = await this.prismaService.message.create({
        data: {
          senderId: userParticipantId,
          conversationId,
          replyToMessageId: parentMessageId || null,
          type: MessageType.MEDIA,
          content: null,
          messageMedias: {
            createMany: {
              data: [
                {
                  type: media.mediaType,
                  url: media.url,
                  fileName: media.fileName
                }
              ]
            }
          }
        }
      });
      createdMessages.push(mediaMessage);
    }

    // Create text message if content exists
    let textMessage = null;
    if (content) {
      textMessage = await this.prismaService.message.create({
        data: {
          senderId: userParticipantId,
          conversationId,
          replyToMessageId: parentMessageId || null,
          type: messageType,
          content
        }
      });
      createdMessages.push(textMessage);
    }

    // Set the last message flag
    const lastMessage = createdMessages[createdMessages.length - 1];
    if (lastMessage) {
      // Cập nhật last seen message của người dùng nếu có tin nhắn được tạo
      await this.prismaService.conversationParticipant.update({
        where: {
          id: userParticipantId
        },
        data: {
          lastSeenMessageId: lastMessage.id,
          lastSeenMessageAt: new Date()
        }
      });
    }

    await this.prismaService.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date()
      }
    });

    return {
      message: 'Message sent successfully'
    };
  };

  async getConversationMessages(
    conversationId: string,
    query: PaginationQueryDTO,
    userId: string
  ): Promise<PaginationResponseDTO<GetConversationMessageResponseDTO>> {
    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    const [messages, pagination] = await this.prismaService.message
      .paginate({
        where: {
          conversationId,
          deletedBy: {
            none: {
              participantId: userParticipantId
            }
          }
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
          },
          systemActionDetail: {
            include: {
              actor: {
                include: {
                  user: true
                }
              },
              target: {
                include: {
                  user: true
                }
              }
            }
          },
          conversation: {
            select: {
              isGroupChat: true
            }
          },
          replyToMessage: {
            include: {
              sender: {
                include: {
                  user: true
                }
              },
              messageMedias: true
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

    // Helper function to format system message content
    const formatSystemMessageContent = (message: any): string => {
      if (!message.systemActionDetail) {
        return 'System message';
      }

      const actorName =
        message.systemActionDetail.actor.userId === userId
          ? 'You'
          : message.systemActionDetail.actor.user.fullName;

      switch (message.systemAction) {
        case 'CHANGE_BACKGROUND':
          return `${actorName} changed the theme to ${message.systemActionDetail.newValue}`;

        case 'ADD_MEMBER':
          if (message.systemActionDetail.target) {
            return `${actorName} added ${message.systemActionDetail.target.user.fullName} to the group`;
          }
          return `${actorName} added a member to the group`;

        case 'REMOVE_MEMBER':
          if (message.systemActionDetail.target) {
            return `${actorName} removed ${message.systemActionDetail.target.user.fullName} from the group`;
          }
          return `${actorName} removed a member from the group`;

        case 'CHANGE_CONVERSATION_NAME':
          return `${actorName} changed the group name to ${message.systemActionDetail.newValue}`;

        case 'LEAVE_CONVERSATION':
          return `${actorName} left the group`;

        case 'CHANGE_EMOTICONS':
          return `${actorName} changed the conversation emoticons`;

        default:
          return `System action occurred`;
      }
    };

    // Process the messages using metascraper for URLs
    const metascraperPromises = messages.map(async (message) => {
      let content = message.content;
      let linkMetadata: LinkMetadata | null = null;

      // For SYSTEM messages, format the content
      if (message.type === MessageType.SYSTEM) {
        content = formatSystemMessageContent(message);
      }

      // For TEXT messages, extract URLs and metadata
      if (message.type === MessageType.TEXT && message.content) {
        const url = extractUrl(message.content);

        if (url) {
          linkMetadata = await this.redisService.getLinkMetadata(url);
        }
      }

      const actionsOnMessage: ActionsOnMessageDTO = {
        canRevoke:
          message.sender?.userId === userId && !message.isRevokedForEveryone,
        canReply:
          !message.isRevokedForEveryone &&
          message.type !== MessageType.CALL &&
          message.type !== MessageType.SYSTEM,
        canDropEmotion:
          !message.isRevokedForEveryone &&
          message.type !== MessageType.CALL &&
          message.type !== MessageType.SYSTEM
      };

      // Construct the message response according to DTO structure
      const messageDTO: GetConversationMessageResponseDTO = {
        id: message.id,
        type: message.type,
        systemAction: message.systemAction,
        callStatus: message.callStatus,
        callDuration: message.callDuration,
        sender: message.sender
          ? {
              id: message.sender.id,
              profile: message.sender.user,
              role: message.sender.role
            }
          : null,
        content,
        mediaList: message.messageMedias,
        reactionsData: formatMessageReactions(message.messageEmotions),
        createdAt: message.createdAt,
        isRevokedForEveryone: !!message.isRevokedForEveryone,
        replyToMessage: message.replyToMessage
          ? {
              id: message.replyToMessage.id,
              type: message.replyToMessage.type,
              content: message.replyToMessage.content,
              createdAt: message.replyToMessage.createdAt,
              isRevokedForEveryone:
                !!message.replyToMessage.isRevokedForEveryone,
              sender: message.replyToMessage.sender
                ? {
                    id: message.replyToMessage.sender.id,
                    profile: message.replyToMessage.sender.user,
                    role: message.replyToMessage.sender.role
                  }
                : null,
              mediaList: message.replyToMessage.messageMedias
            }
          : null,
        seenBy: message.lastSeenBy
          .filter((v) => v.userId !== userId)
          .map((seenParticipant) => ({
            id: seenParticipant.id,
            profile: seenParticipant.user,
            role: seenParticipant.role,
            seenAt: seenParticipant.lastSeenMessageAt || new Date()
          })),
        linkMetadata,
        actionsOnMessage
      };

      return messageDTO;
    });

    // Wait for all metascraper promises to resolve
    const paginatedData = await Promise.all(metascraperPromises);

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
    emojiCode: string
  ): Promise<MessageResponseDTO> {
    //Validate emojiCode
    const isValidEmoji = await getEmojiDisplayUrl(emojiCode);
    if (!isValidEmoji) {
      throw new BadRequestException('Invalid emoji code');
    }

    // Find the message and check if it exists
    const message = await this.prismaService.message
      .findUniqueOrThrow({
        where: {
          id: messageId,
          conversationId
        }
      })
      .catch(() => {
        throw new NotFoundException('Message not found');
      });

    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    await this.validateActionOnMessage(message, userParticipantId);

    // Check if an emotion already exists for this participant and message
    const existingEmotion = await this.prismaService.messageEmotion.findUnique({
      where: {
        messageId_participantId: {
          messageId,
          participantId: userParticipantId
        }
      }
    });

    if (existingEmotion) {
      // Update existing emotion if emojiCode is different
      if (existingEmotion.emojiCode !== emojiCode) {
        const _updatedEmotion = await this.prismaService.messageEmotion.update({
          where: {
            id: existingEmotion.id
          },
          data: {
            emojiCode
          }
        });

        return {
          message: 'Message emotion updated successfully'
        };
      }
      return {
        message: 'Message emotion not changed'
      };
    }
    // Create a new emotion
    const _newEmotion = await this.prismaService.messageEmotion.create({
      data: {
        emojiCode,
        messageId,
        participantId: userParticipantId
      }
    });

    return {
      message: 'Dropped message emotion successfully'
    };
  }

  async removeMessageEmotion(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<MessageResponseDTO> {
    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    const _messageEmotion = await this.prismaService.messageEmotion
      .findUniqueOrThrow({
        where: {
          messageId_participantId: {
            messageId,
            participantId: userParticipantId
          }
        }
      })
      .catch(() => {
        throw new NotFoundException('Message emotion not found');
      });

    await this.prismaService.messageEmotion.delete({
      where: {
        id: _messageEmotion.id
      }
    });

    return {
      message: 'Remove message emotion successfully'
    };
  }

  revokeMessage = async (
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<MessageResponseDTO> => {
    const message = await this.prismaService.message
      .findUniqueOrThrow({
        where: {
          id: messageId,
          conversationId
        },
        include: {
          sender: {
            include: {
              user: {
                select: {
                  id: true
                }
              }
            }
          },
          messageMedias: true
        }
      })
      .catch(() => {
        throw new NotFoundException('Message not found');
      });

    if (message.sender?.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to revoke this message'
      );
    }

    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    await this.validateActionOnMessage(message, userParticipantId);

    // Xóa content, media của message nếu có
    const _revokeMessage = await this.prismaService.message.update({
      where: {
        id: messageId
      },
      data: {
        content: null,
        isRevokedForEveryone: true,
        messageMedias: {
          deleteMany: {
            messageId
          }
        },
        messageEmotions: {
          deleteMany: {
            messageId
          }
        }
      },
      include: {
        messageMedias: {
          select: {
            url: true
          }
        }
      }
    });

    await this.cloudinaryQueueService.deleteFiles(
      _revokeMessage.messageMedias.map((media) => media.url)
    );

    return {
      message: 'Revoke message successfully!'
    };
  };

  deleteMessage = async (
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<MessageResponseDTO> => {
    const message = await this.prismaService.message
      .findUniqueOrThrow({
        where: {
          id: messageId,
          conversationId
        }
      })
      .catch(() => {
        throw new NotFoundException('Message not found');
      });

    if (message.type === MessageType.SYSTEM) {
      throw new ForbiddenException(
        'You are not allowed to delete this type of message'
      );
    }

    const userParticipantId =
      await this.redisService.getConversationParticipantId(
        conversationId,
        userId
      );

    const _deletedMessage = await this.prismaService.deletedMessage.create({
      data: {
        messageId,
        participantId: userParticipantId
      }
    });

    return {
      message: 'Delete message successfully!'
    };
  };
}
