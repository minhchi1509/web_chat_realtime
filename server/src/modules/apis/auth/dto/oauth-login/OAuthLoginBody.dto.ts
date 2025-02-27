import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';
import { TwoFactorCodeBodyDTO } from 'src/common/dto/TwoFactorCodeBody.dto';

export class OAuthLoginBodyDTO extends TwoFactorCodeBodyDTO {
  @Trim()
  @IsString()
  @IsNotEmpty()
  oauthToken: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;
}
