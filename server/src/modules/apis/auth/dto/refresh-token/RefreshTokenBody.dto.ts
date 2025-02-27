import { IsNotEmpty, IsString } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class RefreshTokenBodyDTO {
  @Trim()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
