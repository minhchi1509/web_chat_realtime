import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { IRequest } from 'src/common/types/common.type';

export const RequestHeader = createParamDecorator(
  (targetDTO: any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest<IRequest>().headers;
    const headersInstance = plainToInstance(targetDTO, headers);
    return headersInstance;
  }
);

export const UserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<IRequest>();
    const user = request.user;
    return user.sub;
  }
);
