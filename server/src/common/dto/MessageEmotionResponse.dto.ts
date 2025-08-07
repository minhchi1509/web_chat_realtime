import { ApiProperty } from '@nestjs/swagger';
import { MessageEmotionType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';

export class MessageEmotionResponseDTO {
  @Expose()
  id: string;

  @ApiProperty({ enum: MessageEmotionType })
  @Expose()
  type: MessageEmotionType;

  @Expose()
  @Type(() => ConversationParticipantResponseDTO)
  participant: ConversationParticipantResponseDTO;

  @Expose()
  createdAt: Date;
}
