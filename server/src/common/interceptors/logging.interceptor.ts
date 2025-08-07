import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Request } from 'express';
import { catchError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const contextType = context.getType();

    const logContext = () => {
      if (contextType === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        return `\n👉 Context type: ${contextType.toUpperCase()}\n👉 Method: ${request.method}\n👉 Path: ${request.url}`;
      }
      if (contextType === 'ws') {
        const wsCtx = context.switchToWs();
        const pattern = wsCtx.getPattern();
        return `\n👉 Context type: ${contextType.toUpperCase()}\n👉 Pattern: ${pattern}`;
      }
    };

    return next.handle().pipe(
      catchError((error) => {
        const isLoggable =
          (!(error instanceof WsException) &&
            !(error instanceof HttpException)) ||
          error instanceof InternalServerErrorException;
        if (isLoggable) {
          this.logger.error(
            `${logContext()}\n👉 Details: ${error.stack?.toString()}`
          );
        }
        throw error;
      })
    );
  }
}
