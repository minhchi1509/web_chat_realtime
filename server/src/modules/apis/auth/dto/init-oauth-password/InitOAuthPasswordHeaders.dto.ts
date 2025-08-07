import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsJWT, IsNotEmpty } from 'class-validator';

import { EHeaderKey } from 'src/common/constants/common.enum';
import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class InitOAuthPasswordHeadersDTO {
  @ApiProperty({ name: EHeaderKey.X_INIT_OAUTH_PASSWORD_TOKEN })
  @Expose({ name: EHeaderKey.X_INIT_OAUTH_PASSWORD_TOKEN })
  @Trim()
  @IsJWT()
  @IsNotEmpty()
  token: string;
}
