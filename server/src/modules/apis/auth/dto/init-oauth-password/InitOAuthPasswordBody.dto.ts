import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class InitOAuthPasswordBodyDTO {
  @Trim()
  @MaxLength(20)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
