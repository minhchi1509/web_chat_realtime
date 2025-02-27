import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Request, Response } from 'express';
import { Socket } from 'socket.io';

import { BaseExceptionResponse } from 'src/common/dto/BaseExceptionResponse.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(
    exception: WsException | HttpException | Error,
    host: ArgumentsHost
  ): void {
    const contextType = host.getType();

    if (contextType === 'http') {
      this.handleHttpException(exception, host);
    } else if (contextType === 'ws') {
      this.handleWsException(exception, host);
    }

    const isLoggableException =
      !(exception instanceof WsException) &&
      !(exception instanceof HttpException);

    if (isLoggableException) {
      this.logUnhandledException(exception, host);
    }
  }

  private handleWsException(
    exception: WsException | Error,
    host: ArgumentsHost
  ) {
    const socketClient = host.switchToWs().getClient<Socket>();
    const wsData = host.switchToWs().getData();
    const pattern = host.switchToWs().getPattern();
    const wsError = !(exception instanceof WsException)
      ? 'Internal server error'
      : exception.getError();

    const errorDetails =
      wsError instanceof Object ? { ...wsError } : { message: wsError };
    socketClient.emit('ws_exception', {
      ...errorDetails,
      id: socketClient.id,
      pattern,
      data: wsData
    });
  }

  private handleHttpException(
    exception: HttpException | Error,
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let responseBody: BaseExceptionResponse = {
      statusCode,
      message,
      path: request.url,
      details: null
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      if (statusCode !== HttpStatus.INTERNAL_SERVER_ERROR) {
        const exceptionResponseMessage: string | undefined = (
          exception.getResponse() as any
        ).message;
        message = exceptionResponseMessage || 'Unknown error message';

        const { error, ...extraErrorFields } = exception.getResponse() as any;

        responseBody = {
          ...responseBody,
          ...extraErrorFields,
          message,
          statusCode
        };
      }
    }

    response.status(statusCode).json(responseBody);
  }

  private logUnhandledException(exception: Error, host: ArgumentsHost) {
    const contextType = host.getType();

    if (contextType === 'http') {
      const httpCtx = host.switchToHttp();
      const request = httpCtx.getRequest<Request>();
      this.logger.error(
        `\n👉 Context type: ${contextType.toUpperCase()}\n👉 Method: ${request.method}\n👉 Path: ${request.url}\n👉 Details: ${exception.stack?.toString()}`
      );
    } else if (contextType === 'ws') {
      const wsCtx = host.switchToWs();
      const pattern = wsCtx.getPattern();
      this.logger.error(
        `\n👉 Context type: ${contextType.toUpperCase()}\n👉 Pattern: ${pattern}\n👉 Details: ${exception.stack?.toString()}`
      );
    }
  }
}
