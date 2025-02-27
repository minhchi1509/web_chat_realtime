import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class ChangePasswordBodyDTO {
  @Trim()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}
