import { ApiProperty } from '@nestjs/swagger';
import { MessageEmotionType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class DropMessageEmotionBodyDTO {
  @ApiProperty({
    description: 'Emotion type',
    enum: MessageEmotionType,
    example: 'LIKE'
  })
  @Trim()
  @IsEnum(MessageEmotionType)
  @IsNotEmpty()
  emotionType: MessageEmotionType;
}
