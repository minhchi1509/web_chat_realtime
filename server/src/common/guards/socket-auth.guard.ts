import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';

import { EStrategyName } from 'src/common/constants/common.enum';

@Injectable()
export class SocketAuthGuard extends AuthGuard(EStrategyName.JWT_SOCKET) {
  handleRequest<TJWTPayload>(_err: any, user: TJWTPayload) {
    if (!user) {
      throw new WsException({
        message: 'Invalid token',
        errorCode: 401
      });
    }
    return user;
  }
}
