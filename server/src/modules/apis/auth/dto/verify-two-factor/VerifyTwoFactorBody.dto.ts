import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class VerifyTwoFactorAuthBodyDTO {
  @Trim()
  @Length(6, 6)
  @IsNumberString()
  @IsNotEmpty()
  otpCode: string;
}
