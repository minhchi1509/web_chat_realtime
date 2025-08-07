import { IntersectionType } from '@nestjs/swagger';

import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { LoginResponseDTO } from 'src/modules/apis/auth/dto/login/LoginResponse.dto';

export class RefreshTokenResponseDTO extends IntersectionType(
  MessageResponseDTO,
  LoginResponseDTO
) {}
