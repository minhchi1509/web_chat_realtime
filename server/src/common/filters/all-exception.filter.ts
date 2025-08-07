import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Socket } from 'socket.io';

import { BaseExceptionResponse } from 'src/common/dto/BaseExceptionResponse.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const contextType = host.getType();

    if (contextType === 'http') {
      this.handleHttpException(exception, host);
    } else if (contextType === 'ws') {
      this.handleWsException(exception, host);
    }
  }

  private handleWsException(_exception: Error, host: ArgumentsHost) {
    const socketClient = host.switchToWs().getClient<Socket>();
    const wsData = host.switchToWs().getData();
    const pattern = host.switchToWs().getPattern();

    const responseBody = {
      clientId: socketClient.id,
      pattern,
      payload: wsData,
      message:
        'An unexpected error occurred. Please contact admin to resolve this issue.',
      errors: 'Internal server error'
    };

    socketClient.emit('ws_exception', responseBody);
  }

  private handleHttpException(_exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseBody: BaseExceptionResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        'An unexpected error occurred. Please contact admin to resolve this issue.',
      path: request.url,
      errors: 'Internal server error'
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseBody);
  }
}
