import {
  BadRequestException,
  Injectable,
  ValidationPipe
} from '@nestjs/common';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Invalid request body data',
          details: errors
        })
    });
  }
}
