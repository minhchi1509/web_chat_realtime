import {
  TConversationParticipantResponse,
  TConversationResponse
} from 'src/types/api/model.type';

type TConversationDetailParticipantResponse =
  TConversationParticipantResponse & {
    isOnline: boolean;
    lastOnlineAt: string | null;
  };

export type TGetConversationDetailsResponse = TConversationResponse & {
  participants: TConversationDetailParticipantResponse[];
};
