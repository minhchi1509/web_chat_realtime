import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

import { EDevicePlatform } from 'src/common/constants/common.enum';

export class TestSendNotificationBodyDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  launchUrl?: string;

  @IsUUID()
  @IsNotEmpty()
  toUserId: string;

  @IsEnum(EDevicePlatform)
  @IsOptional()
  @ApiProperty({
    enum: EDevicePlatform,
    required: false,
    default: EDevicePlatform.WEB
  })
  platform: EDevicePlatform | 'all' = EDevicePlatform.WEB;
}
