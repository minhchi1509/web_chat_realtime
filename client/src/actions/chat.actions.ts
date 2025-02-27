'use server';

import axiosInstance from 'src/configs/http-request.config';
import { TCreatePrivateConversationResponse } from 'src/types/api/chat/create-private-conversation.type';
import {
  TGetChatMembersQuery,
  TGetChatMembersResponse
} from 'src/types/api/chat/get-chat-members.type';
import { TGetConversationDetailsResponse } from 'src/types/api/chat/get-conversation-details.type';
import { TGetConversationMessagesResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { TGetConversationsResponse } from 'src/types/api/chat/get-conversations.type';
import { TPaginationQuery } from 'src/types/common.type';
import { withSafeServerAction } from 'src/utils/common.util';

export const getChatMembers = withSafeServerAction(
  async (query: TGetChatMembersQuery) => {
    const { data } = await axiosInstance.get<TGetChatMembersResponse>(
      '/api/v1/chat/members',
      {
        params: query
      }
    );
    return data;
  }
);

export const getConversations = withSafeServerAction(
  async (query: TPaginationQuery) => {
    const { data } = await axiosInstance.get<TGetConversationsResponse>(
      '/api/v1/chat/conversations',
      {
        params: query
      }
    );
    return data;
  }
);

export const getConversationDetails = withSafeServerAction(
  async (conversationId: string) => {
    const { data } = await axiosInstance.get<TGetConversationDetailsResponse>(
      `/api/v1/chat/${conversationId}/details`
    );
    return data;
  }
);

export const getConversationMessages = withSafeServerAction(
  async (conversationId: string, query: TPaginationQuery) => {
    const { data } = await axiosInstance.get<TGetConversationMessagesResponse>(
      `/api/v1/chat/${conversationId}/messages`,
      {
        params: query
      }
    );
    return data;
  }
);

export const sendMessage = withSafeServerAction(
  async (conversationId: string, messageBody: FormData) => {
    const { data } = await axiosInstance.post(
      `/api/v1/chat/${conversationId}/send-message`,
      messageBody
    );
    return data;
  }
);

export const getMessageVideoMediaBlob = withSafeServerAction(
  async (mediaId: string) => {
    const { data } = await axiosInstance.get(
      `/api/v1/file/stream/message/${mediaId}`,
      {
        responseType: 'blob'
      }
    );
    return data;
  }
);

export const createPrivateConversation = withSafeServerAction(
  async (receiverId: string) => {
    const { data } =
      await axiosInstance.post<TCreatePrivateConversationResponse>(
        '/api/v1/chat/private/create',
        { receiverId }
      );
    return data;
  }
);
