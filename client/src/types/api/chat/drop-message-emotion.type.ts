import { EMessageEmotionType } from 'src/constants/enum';
import { MessageEmotionResponse } from 'src/types/api/model.type';

export type TDropMessageEmotionBody = {
  emotionType: EMessageEmotionType;
};

export type TDropMessageEmotionParams = {
  conversationId: string;
  messageId: string;
};

export type TDropMessageEmotionResponse = {
  message: string;
  droppedEmotion: MessageEmotionResponse;
};
