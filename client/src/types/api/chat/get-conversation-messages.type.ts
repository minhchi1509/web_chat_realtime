import {
  MessageEmotionResponse,
  TConversationParticipantResponse,
  TMessageMediaResponse
} from 'src/types/api/model.type';
import { TGetListResponse } from 'src/types/common.type';

export type TConversationMessageResponse = {
  id: string;
  sender: TConversationParticipantResponse;
  content: string | null;
  mediaList: TMessageMediaResponse[];
  emotions: MessageEmotionResponse[];
  createdAt: string;
  isLastMessageOfConversation: boolean;
  isShowSeperateTime: boolean;
  seenBy: (TConversationParticipantResponse & { seenAt: string })[];
};

export type TGetConversationMessagesResponse =
  TGetListResponse<TConversationMessageResponse>;
