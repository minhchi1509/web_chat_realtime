import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { SOCKET_EVENTS_NAME_TO_CLIENT } from 'src/common/constants/socket-events.constant';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
  UseFormData
} from 'src/common/decorators/common.decorator';
import { UserId } from 'src/common/decorators/request-object.decorator';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { PaginationQueryDTO } from 'src/common/dto/PaginationQuery.dto';
import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';
import { ConversationPolicyGuard } from 'src/common/guards/conversation-policy.guard';
import { plainToInstancePaginationResponse } from 'src/common/utils/common.util';
import { ChatService } from 'src/modules/apis/chat/chat.service';
import { CreatedPrivateChatResponseDTO } from 'src/modules/apis/chat/dto/create-private-chat/CreatedPrivateChatResponse.dto';
import { CreatePrivateChatBodyDTO } from 'src/modules/apis/chat/dto/create-private-chat/CreatePrivateChatBody.dto';
import { DropMessageEmotionBodyDTO } from 'src/modules/apis/chat/dto/drop-message-emotion/DropMessageEmotionBody.dto';
import { GetChatMemberResponseDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMemberResponse.dto';
import { GetChatMembersQueryDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMembersQuery.dto';
import { GetConversationDetailsResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-details/GetConversationDetailsResponse.dto';
import { GetConversationMessageResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-messages/GetConversationMessageResponse.dto';
import { GetConversationResponseDTO } from 'src/modules/apis/chat/dto/get-conversations/GetConversationResponse.dto';
import { SendConversationMessageDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageBody.dto';
import { SendConversationMessageResponseDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageResponse.dto';
import { ChatSocketService } from 'src/modules/web-socket/chat/chat-socket.service';

@Controller('chat')
@ApiTags('Chat')
@ApiExceptionResponse()
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatSocketService: ChatSocketService
  ) {}

  @Get('members')
  @ApiOkResponsePaginated(GetChatMemberResponseDTO)
  async getChatMembers(
    @UserId() userId: string,
    @Query() query: GetChatMembersQueryDTO
  ): Promise<PaginationResponseDTO<GetChatMemberResponseDTO>> {
    const responseData = await this.chatService.getChatMembers(userId, query);
    return plainToInstancePaginationResponse(
      GetChatMemberResponseDTO,
      responseData
    );
  }

  @Post('private/create')
  async createPrivateChat(
    @Body() body: CreatePrivateChatBodyDTO,
    @UserId() userId: string
  ): Promise<CreatedPrivateChatResponseDTO> {
    const createdConversation = await this.chatService.createPrivateChat(
      userId,
      body.receiverId
    );
    return plainToInstance(CreatedPrivateChatResponseDTO, createdConversation);
  }

  @Get('conversations')
  @ApiOkResponsePaginated(GetConversationResponseDTO)
  async getUserConversations(
    @Query() query: PaginationQueryDTO,
    @UserId() userId: string
  ): Promise<PaginationResponseDTO<GetConversationResponseDTO>> {
    const conversations = await this.chatService.getUserConversations(
      query,
      userId
    );
    return plainToInstancePaginationResponse(
      GetConversationResponseDTO,
      conversations
    );
  }

  @Get('/:conversationId/details')
  @UseGuards(ConversationPolicyGuard)
  async getConversationDetails(
    @Param('conversationId') conversationId: string,
    @UserId() userId: string
  ): Promise<GetConversationDetailsResponseDTO> {
    const conversation = await this.chatService.getConversationDetails(
      conversationId,
      userId
    );
    return plainToInstance(GetConversationDetailsResponseDTO, conversation);
  }

  @Post('/:conversationId/send-message')
  @UseGuards(ConversationPolicyGuard)
  @UseFormData()
  async sendConversationMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: SendConversationMessageDTO,
    @UserId() userId: string
  ): Promise<SendConversationMessageResponseDTO> {
    const sentMessage = await this.chatService.sendConversationMessage(
      conversationId,
      body.parentMessageId,
      userId,
      body
    );
    await this.chatSocketService.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.CONVERSATION_DETAIL_UPDATED,
      { conversationId }
    );
    return plainToInstance(SendConversationMessageResponseDTO, sentMessage);
  }

  @Get('/:conversationId/messages')
  @UseGuards(ConversationPolicyGuard)
  @ApiOkResponsePaginated(GetConversationMessageResponseDTO)
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: PaginationQueryDTO,
    @UserId() userId: string
  ): Promise<PaginationResponseDTO<GetConversationMessageResponseDTO>> {
    const messages = await this.chatService.getConversationMessages(
      conversationId,
      query,
      userId
    );
    return plainToInstancePaginationResponse(
      GetConversationMessageResponseDTO,
      messages
    );
  }

  @Post('/:conversationId/messages/:messageId/drop-emotion')
  @UseGuards(ConversationPolicyGuard)
  async dropMessageEmotion(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() body: DropMessageEmotionBodyDTO,
    @UserId() userId: string
  ): Promise<MessageResponseDTO> {
    const droppedEmotion = await this.chatService.dropMessageEmotion(
      conversationId,
      messageId,
      userId,
      body.emojiCode
    );
    await this.chatSocketService.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.CONVERSATION_DETAIL_UPDATED,
      { conversationId }
    );
    return plainToInstance(MessageResponseDTO, droppedEmotion);
  }

  @Delete('/:conversationId/messages/:messageId/remove-emotion')
  @UseGuards(ConversationPolicyGuard)
  async removeMessageEmotion(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @UserId() userId: string
  ): Promise<MessageResponseDTO> {
    const removedEmotion = await this.chatService.removeMessageEmotion(
      conversationId,
      messageId,
      userId
    );
    await this.chatSocketService.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.CONVERSATION_DETAIL_UPDATED,
      { conversationId }
    );
    return plainToInstance(MessageResponseDTO, removedEmotion);
  }

  @Post('/:conversationId/messages/:messageId/revoke')
  @UseGuards(ConversationPolicyGuard)
  async revokeMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @UserId() userId: string
  ): Promise<MessageResponseDTO> {
    const revokedMessage = await this.chatService.revokeMessage(
      conversationId,
      messageId,
      userId
    );
    await this.chatSocketService.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.CONVERSATION_DETAIL_UPDATED,
      { conversationId }
    );
    return plainToInstance(MessageResponseDTO, revokedMessage);
  }

  @Post('/:conversationId/messages/:messageId/delete')
  @UseGuards(ConversationPolicyGuard)
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @UserId() userId: string
  ): Promise<MessageResponseDTO> {
    const deletedMessage = await this.chatService.deleteMessage(
      conversationId,
      messageId,
      userId
    );
    await this.chatSocketService.sendNotificationToConversationMembers(
      conversationId,
      SOCKET_EVENTS_NAME_TO_CLIENT.CHAT.CONVERSATION_DETAIL_UPDATED,
      { conversationId }
    );
    return plainToInstance(MessageResponseDTO, deletedMessage);
  }
}
