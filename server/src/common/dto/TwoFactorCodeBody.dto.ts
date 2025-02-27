import {
  IsNumberString,
  IsOptional,
  Length,
  ValidateIf
} from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class TwoFactorCodeBodyDTO {
  @IsOptional()
  @ValidateIf((o) => o.otpCode)
  @Trim()
  @Length(6, 6)
  @IsNumberString()
  otpCode?: string;
}
