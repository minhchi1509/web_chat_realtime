import { Expose, Type } from 'class-transformer';

import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';

export class GenerateTwoFAResponseDTO {
  @Expose()
  @Type(() => UserResponseDTO)
  user: UserResponseDTO;

  @Expose()
  qrCodeUrl: string;

  @Expose()
  secretKey: string;
}
