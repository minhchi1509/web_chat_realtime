import { ApiProperty } from '@nestjs/swagger';
import { ConversationRole } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class ConversationParticipantProfileDTO {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  avatar: string;
}

export class ConversationParticipantResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ConversationParticipantProfileDTO)
  profile: ConversationParticipantProfileDTO;

  @Expose()
  @ApiProperty({ enum: ConversationRole })
  role: ConversationRole;
}
