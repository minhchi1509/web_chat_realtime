import { EMessageEmotionType } from 'src/constants/enum';

export type TMessageMedia = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'FILE';
export type TConversationRole = 'ADMIN' | 'MEMBER';

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
  type: TMessageMedia;
  fileName: string | null;
};

export type TConversationParticipantResponse = {
  id: string;
  profile: TUserResponse;
  role: TConversationRole;
};

export type MessageEmotionResponse = {
  id: string;
  type: EMessageEmotionType;
  participant: TConversationParticipantResponse;
  createdAt: string;
};
