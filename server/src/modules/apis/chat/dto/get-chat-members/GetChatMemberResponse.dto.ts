import { Expose, Type } from 'class-transformer';

import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';

export class GetChatMemberResponseDTO {
  @Expose()
  @Type(() => UserResponseDTO)
  profile: UserResponseDTO;

  @Expose()
  isOnline: boolean;
}
