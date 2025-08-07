import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class LoginBodyDTO {
  @Trim()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;
}
