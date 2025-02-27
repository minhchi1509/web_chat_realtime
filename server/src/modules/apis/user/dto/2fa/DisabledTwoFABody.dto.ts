import { IsNotEmpty, IsString } from 'class-validator';

export class DisabledTwoFABodyDTO {
  @IsString()
  @IsNotEmpty()
  password: string;
}
