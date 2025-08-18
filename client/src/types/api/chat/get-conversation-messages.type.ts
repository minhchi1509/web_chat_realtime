import {
  ECallStatus,
  EMessageType,
  ESystemAction,
  TConversationParticipantResponse,
  TMessageMediaResponse
} from 'src/types/api/model.type';
import { TGetListResponse } from 'src/types/common.type';

export type TParentMessageResponse = {
  id: string;
  type: EMessageType;
  content: string | null;
  createdAt: string;
  isRevokedForEveryone: boolean;
  mediaList: TMessageMediaResponse[];
  sender: TConversationParticipantResponse | null;
};

export type TMessageReactionsData = {
  total: number;
  topReactions: string[];
};

export type TLinkMetadata = {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

export type TActionOnMessageResponse = {
  canRevoke: boolean;
  canReply: boolean;
  canDropEmotion: boolean;
};

export type TConversationMessageResponse = {
  id: string;
  type: EMessageType;
  systemAction: ESystemAction | null;
  content: string | null;
  callStatus: ECallStatus | null;
  callDuration: number | null;
  createdAt: string;
  isRevokedForEveryone: boolean;
  mediaList: TMessageMediaResponse[];
  reactionsData: TMessageReactionsData;
  replyToMessage: TParentMessageResponse | null;
  sender: TConversationParticipantResponse | null;
  seenBy: (TConversationParticipantResponse & { seenAt: string })[];
  linkMetadata: TLinkMetadata | null;
  actionsOnMessage: TActionOnMessageResponse;
};

export type TGetConversationMessagesResponse =
  TGetListResponse<TConversationMessageResponse>;
