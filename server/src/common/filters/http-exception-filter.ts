import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BaseExceptionResponse } from 'src/common/dto/BaseExceptionResponse.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string =
      'An unexpected error occurred. Please contact admin to resolve this issue.';
    let responseBody: BaseExceptionResponse = {
      statusCode,
      message,
      path: request.url,
      errors: null
    };

    statusCode = exception.getStatus();
    if (statusCode !== HttpStatus.INTERNAL_SERVER_ERROR) {
      const exceptionResponse = exception.getResponse();
      const exceptionMessage: string | undefined =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;

      message = exceptionMessage || 'Unknown error message';

      let extraErrorFields: Record<string, any> = {};
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        extraErrorFields = { ...exceptionResponse };
        delete extraErrorFields.error;
      }

      responseBody = {
        ...responseBody,
        ...extraErrorFields,
        message,
        statusCode
      };
    }

    response.status(statusCode).json(responseBody);
  }
}
