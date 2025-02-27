import { IsEmail, IsNotEmpty } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class SendResetPasswordMailBodyDto {
  @Trim()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
