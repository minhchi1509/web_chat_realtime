export enum EConversationRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum EMessageMediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE'
}

export enum EMessageType {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  SYSTEM = 'SYSTEM',
  CALL = 'CALL',
  ICON = 'ICON'
}

export enum ESystemAction {
  CHANGE_BACKGROUND = 'CHANGE_BACKGROUND',
  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  CHANGE_CONVERSATION_NAME = 'CHANGE_CONVERSATION_NAME',
  LEAVE_CONVERSATION = 'LEAVE_CONVERSATION',
  CHANGE_EMOTICONS = 'CHANGE_EMOTICONS'
}

export enum ECallStatus {
  ENDED = 'ENDED',
  MISSED = 'MISSED'
}

export type TUserResponse = {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  isEnableTwoFactorAuth: boolean;
};

export type TConversationResponse = {
  id: string;
  name: string;
  thumbnail: string;
  isGroupChat: boolean;
  createdAt: string;
};

export type TMessageMediaResponse = {
  id: string;
  url: string;
  type: EMessageMediaType;
  fileName: string | null;
};

export type TConversationParticipantResponse = {
  id: string;
  profile: Omit<TUserResponse, 'email' | 'isEnableTwoFactorAuth'>;
  role: EConversationRole;
};

export type TMessageEmotionResponse = {
  id: string;
  emojiCode: string;
  participant: TConversationParticipantResponse;
  createdAt: string;
};

export type TSuccessMessageResponse = {
  message: string;
};
