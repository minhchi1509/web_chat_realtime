import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class DropMessageEmotionBodyDTO {
  @Trim()
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  emojiCode: string;
}
