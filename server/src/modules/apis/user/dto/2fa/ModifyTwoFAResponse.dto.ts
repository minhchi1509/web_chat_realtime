import { Expose, Type } from 'class-transformer';

import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';

export class ModifyTwoFAResponseDTO extends MessageResponseDTO {
  @Expose()
  @Type(() => UserResponseDTO)
  user: UserResponseDTO;
}
