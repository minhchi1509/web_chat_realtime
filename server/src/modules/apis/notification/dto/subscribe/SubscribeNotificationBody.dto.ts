import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { EDevicePlatform } from 'src/common/constants/common.enum';

export class SubscribeNotificationBodyDTO {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @IsEnum(EDevicePlatform)
  @IsNotEmpty()
  platform: EDevicePlatform;
}
