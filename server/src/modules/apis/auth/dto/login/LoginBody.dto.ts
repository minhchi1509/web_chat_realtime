import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';
import { TwoFactorCodeBodyDTO } from 'src/common/dto/TwoFactorCodeBody.dto';

export class LoginBodyDTO extends TwoFactorCodeBodyDTO {
  @Trim()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;
}
