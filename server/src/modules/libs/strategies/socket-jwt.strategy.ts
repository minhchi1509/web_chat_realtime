import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as cookie from 'cookie';
import { Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';

import { ECookieName, EStrategyName } from 'src/common/constants/common.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import { TJWTPayload } from 'src/common/types/token.type';

@Injectable()
export class SocketJwtStrategy extends PassportStrategy(
  Strategy,
  EStrategyName.JWT_SOCKET
) {
  constructor(
    private readonly configService: ConfigService<IEnvironmentVariables>
  ) {
    super({
      jwtFromRequest: SocketJwtStrategy.extractJWT,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET') as string,
      passReqToCallback: true
    });
  }

  private static extractJWT(socketClient: Socket): string | null {
    if (!socketClient.handshake) {
      return null;
    }

    const cookies = socketClient.handshake.headers.cookie;
    if (!cookies) {
      return null;
    }
    const parsedCookies = cookie.parse(cookies);
    const accessToken = parsedCookies[ECookieName.ACCESS_TOKEN];
    return accessToken || null;
  }

  async validate(socketClient: Socket, payload: TJWTPayload) {
    socketClient.handshake.auth = payload;
    return payload;
  }
}
