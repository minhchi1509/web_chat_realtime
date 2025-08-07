import axiosInstance from 'src/configs/axios.config';
import { TCreatePrivateConversationResponse } from 'src/types/api/chat/create-private-conversation.type';
import {
  TDropMessageEmotionBody,
  TDropMessageEmotionParams,
  TDropMessageEmotionResponse
} from 'src/types/api/chat/drop-message-emotion.type';
import {
  TGetChatMembersQuery,
  TGetChatMembersResponse
} from 'src/types/api/chat/get-chat-members.type';
import { TGetConversationDetailsResponse } from 'src/types/api/chat/get-conversation-details.type';
import { TGetConversationMessagesResponse } from 'src/types/api/chat/get-conversation-messages.type';
import { TGetConversationsResponse } from 'src/types/api/chat/get-conversations.type';
import { TPaginationQuery } from 'src/types/common.type';

export const getChatMembers = async (query: TGetChatMembersQuery) => {
  const { data } = await axiosInstance.get<TGetChatMembersResponse>(
    '/api/v1/chat/members',
    {
      params: query
    }
  );
  return data;
};

export const getConversations = async (query: TPaginationQuery) => {
  const { data } = await axiosInstance.get<TGetConversationsResponse>(
    '/api/v1/chat/conversations',
    {
      params: query
    }
  );
  return data;
};

export const getConversationDetails = async (conversationId: string) => {
  const { data } = await axiosInstance.get<TGetConversationDetailsResponse>(
    `/api/v1/chat/${conversationId}/details`
  );
  return data;
};

export const getConversationMessages = async (
  conversationId: string,
  query: TPaginationQuery
) => {
  const { data } = await axiosInstance.get<TGetConversationMessagesResponse>(
    `/api/v1/chat/${conversationId}/messages`,
    {
      params: query
    }
  );
  return data;
};
export const sendMessage = async (
  conversationId: string,
  messageBody: FormData
) => {
  const { data } = await axiosInstance.post(
    `/api/v1/chat/${conversationId}/send-message`,
    messageBody
  );
  return data;
};

export const createPrivateConversation = async (receiverId: string) => {
  const { data } = await axiosInstance.post<TCreatePrivateConversationResponse>(
    '/api/v1/chat/private/create',
    { receiverId }
  );
  return data;
};

export const dropMessageEmotion = async (
  body: TDropMessageEmotionBody,
  params: TDropMessageEmotionParams
) => {
  const { data } = await axiosInstance.post<TDropMessageEmotionResponse>(
    `/api/v1/chat/${params.conversationId}/messages/${params.messageId}/drop-emotion`,
    body
  );
  return data;
};
