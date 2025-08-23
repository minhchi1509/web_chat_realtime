import { TConversationResponse } from 'src/types/api/model.type';
import { TGetListResponse } from 'src/types/common.type';

type TLastMessageResponse = {
  id: string;
  isSeen: boolean;
  isSendByMe: boolean;
  createdAt: string;
  previewContent: string;
};

export type TGetConversationResponse = TConversationResponse & {
  lastMessage: TLastMessageResponse;
  isOnline: boolean;
};

export type TGetConversationsResponse =
  TGetListResponse<TGetConversationResponse>;
