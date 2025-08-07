import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { EMetadataKey, EStrategyName } from 'src/common/constants/common.enum';

@Injectable()
export class HttpAuthGuard extends AuthGuard(EStrategyName.JWT_HTTP) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
      EMetadataKey.IS_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()]
    );

    if (isPublicRoute) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TJWTPayload>(_err: any, user: TJWTPayload) {
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
