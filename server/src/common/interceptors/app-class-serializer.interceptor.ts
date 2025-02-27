import {
  ClassSerializerInterceptor,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AppClassSerializerInterceptor
  extends ClassSerializerInterceptor
  implements NestInterceptor
{
  constructor(public reflector: Reflector) {
    super(reflector, { strategy: 'excludeAll', excludeExtraneousValues: true });
  }
}
