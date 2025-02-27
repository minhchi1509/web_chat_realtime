import { ApiProperty } from '@nestjs/swagger';
import { MessageMediaType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class MessageMediaResponseDTO {
  @Expose()
  id: string;

  @Expose()
  url: string;

  @Expose()
  @ApiProperty({ enum: MessageMediaType })
  type: MessageMediaType;

  @Expose()
  fileName: string | null;
}
