import { ApiProperty } from '@nestjs/swagger';
import { ConversationRole } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';

export class ConversationParticipantResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserResponseDTO)
  profile: UserResponseDTO;

  @Expose()
  @ApiProperty({ enum: ConversationRole })
  role: ConversationRole;
}
