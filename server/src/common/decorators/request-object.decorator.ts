import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { IRequest } from 'src/common/types/common.type';

export const CustomHeaders = createParamDecorator(
  async (targetDTO: any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest<IRequest>().headers;
    const headersInstance = plainToInstance(targetDTO, headers, {
      excludeExtraneousValues: true
    }) as object;

    return headersInstance;
  }
);

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  }
);

export const UserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<IRequest>();
    const user = request.user;
    return user.sub;
  }
);
