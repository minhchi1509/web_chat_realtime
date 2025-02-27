import { TConversationResponse } from 'src/types/api/model.type';

export type TCreatePrivateConversation = {
  receiverId: string;
};

export type TCreatePrivateConversationResponse = {
  message: string;
  createdConversation: TConversationResponse;
};
