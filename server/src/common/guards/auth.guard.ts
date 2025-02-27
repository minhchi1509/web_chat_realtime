import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { EMetadataKey } from 'src/common/constants/common.enum';
import { IRequest } from 'src/common/types/common.type';
import { TokenService } from 'src/modules/libs/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
      EMetadataKey.IS_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()]
    );
    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    const accessTokenPayload = await this.tokenService.verifyAccessToken(token);
    if (!accessTokenPayload) {
      throw new UnauthorizedException('Invalid token');
    }
    request.user = accessTokenPayload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : undefined;
  }
}
