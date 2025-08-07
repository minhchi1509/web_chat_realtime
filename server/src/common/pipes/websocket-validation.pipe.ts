import { Injectable, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebSocketValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new WsException({
          message: 'Invalid message data',
          errors
        })
    });
  }
}
