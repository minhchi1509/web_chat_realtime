import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
  UseFormData
} from 'src/common/decorators/common.decorator';
import { UserId } from 'src/common/decorators/request-object.decorator';
import { PaginationQueryDTO } from 'src/common/dto/PaginationQuery.dto';
import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';
import { plainToInstancePaginationResponse } from 'src/common/utils/common.util';
import { ChatService } from 'src/modules/apis/chat/chat.service';
import { CreatePrivateChatBodyDTO } from 'src/modules/apis/chat/dto/create-private-chat/CreatePrivateChatBody.dto';
import { CreatePrivateChatResponseDTO } from 'src/modules/apis/chat/dto/create-private-chat/CreatePrivateChatResponse.dto';
import { GetChatMemberResponseDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMemberResponse.dto';
import { GetChatMembersQueryDTO } from 'src/modules/apis/chat/dto/get-chat-members/GetChatMembersQuery.dto';
import { GetConversationDetailsResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-details/GetConversationDetailsResponse.dto';
import { GetConversationMessageResponseDTO } from 'src/modules/apis/chat/dto/get-conversation-messages/GetConversationMessageResponse.dto';
import { GetConversationResponseDTO } from 'src/modules/apis/chat/dto/get-conversations/GetConversationResponse.dto';
import { SendConversationMessageDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageBody.dto';
import { SendConversationMessageResponseDTO } from 'src/modules/apis/chat/dto/send-conversation-message/SendConversationMessageResponse.dto';

@Controller('chat')
@ApiTags('Chat')
@ApiBearerAuth()
@ApiExceptionResponse()
export class ChatController {
  constructor(private chatService: ChatService) {}

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
  ): Promise<CreatePrivateChatResponseDTO> {
    const createdConversation = await this.chatService.createPrivateChat(
      userId,
      body.receiverId
    );
    return plainToInstance(CreatePrivateChatResponseDTO, createdConversation);
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
  @UseFormData()
  async sendConversationMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: SendConversationMessageDTO,
    @UserId() userId: string
  ): Promise<SendConversationMessageResponseDTO> {
    const sentMessage = await this.chatService.sendConversationMessage(
      conversationId,
      userId,
      body
    );
    return plainToInstance(SendConversationMessageResponseDTO, sentMessage);
  }

  @Get('/:conversationId/messages')
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
}
