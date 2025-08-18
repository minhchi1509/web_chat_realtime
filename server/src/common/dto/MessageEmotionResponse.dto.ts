import { Expose, Type } from 'class-transformer';

import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';

export class MessageEmotionResponseDTO {
  @Expose()
  id: string;

  @Expose()
  emojiCode: string;

  @Expose()
  @Type(() => ConversationParticipantResponseDTO)
  participant: ConversationParticipantResponseDTO;

  @Expose()
  createdAt: Date;
}
