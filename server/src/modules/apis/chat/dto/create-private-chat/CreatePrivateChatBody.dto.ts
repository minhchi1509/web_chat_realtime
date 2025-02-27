import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

export class CreatePrivateChatBodyDTO {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  @Trim()
  receiverId: string;
}
