import { HttpException, HttpStatus } from '@nestjs/common';

import { LoginExceptionResponseDTO } from 'src/modules/apis/auth/dto/login/LoginExceptionResponse.dto';

export class LoginException extends HttpException {
  constructor(
    options: Pick<LoginExceptionResponseDTO, 'message' | 'errorType'>
  ) {
    const { message, errorType } = options;
    super({ message, errorType }, HttpStatus.BAD_REQUEST);
  }
}
