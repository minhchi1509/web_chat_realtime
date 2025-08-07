import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendNotificationPayloadDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  launchUrl?: string;
}
