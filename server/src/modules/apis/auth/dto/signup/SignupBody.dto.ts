import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class SignupRequestDTO {
  @Trim()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
