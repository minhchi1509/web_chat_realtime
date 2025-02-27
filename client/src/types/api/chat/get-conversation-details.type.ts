import { TConversationResponse } from 'src/types/api/model.type';

export type TGetConversationDetailsResponse = TConversationResponse & {
  isOnline: boolean;
};
