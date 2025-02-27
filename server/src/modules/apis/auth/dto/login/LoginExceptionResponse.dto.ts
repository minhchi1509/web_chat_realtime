import { Expose } from 'class-transformer';

import { ELoginExceptionErrorType } from 'src/common/constants/common.enum';
import { BaseExceptionResponse } from 'src/common/dto/BaseExceptionResponse.dto';

export class LoginExceptionResponseDTO extends BaseExceptionResponse {
  @Expose()
  errorType: ELoginExceptionErrorType;
}
