import { Expose, Type } from 'class-transformer';

import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';
import { MessageEmotionResponseDTO } from 'src/common/dto/MessageEmotionResponse.dto';
import { MessageMediaResponseDTO } from 'src/common/dto/MessageMediaResponse.dto';

export class ConversationMessageResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ConversationParticipantResponseDTO)
  sender: ConversationParticipantResponseDTO;

  @Expose()
  content: string | null;

  @Expose()
  @Type(() => MessageMediaResponseDTO)
  mediaList: MessageMediaResponseDTO[];

  @Expose()
  @Type(() => MessageEmotionResponseDTO)
  emotions: MessageEmotionResponseDTO[];

  @Expose()
  createdAt: Date;

  @Expose()
  isLastMessageOfConversation: boolean;
}
