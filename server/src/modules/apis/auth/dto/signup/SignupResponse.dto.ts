import { Expose } from 'class-transformer';

export class SignupResponseDTO {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;
}
