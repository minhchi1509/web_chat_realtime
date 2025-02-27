import { Expose, Type } from 'class-transformer';

import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';

export class LoginResponseDTO {
  @Expose()
  @Type(() => UserResponseDTO)
  user: UserResponseDTO;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  expiresIn: number;
}
