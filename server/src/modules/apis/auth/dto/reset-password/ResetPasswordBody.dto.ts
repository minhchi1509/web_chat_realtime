import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class ResetPasswordBodyDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  token: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}
