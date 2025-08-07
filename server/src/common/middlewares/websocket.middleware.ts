import { Injectable } from '@nestjs/common';
import * as cookie from 'cookie';
import { ExtendedError, Socket } from 'socket.io';

import { ECookieName } from 'src/common/constants/common.enum';
import { TokenService } from 'src/modules/libs/token/token.service';

@Injectable()
export class WebSocketMiddleware {
  constructor(private tokenService: TokenService) {}

  async verifyClient(client: Socket, next: (err?: ExtendedError) => void) {
    const cookies = client.handshake.headers.cookie;
    if (!cookies) {
      next(new Error('Cookies not found'));
      return;
    }
    const parsedCookies = cookie.parse(cookies);
    const accessToken = parsedCookies[ECookieName.ACCESS_TOKEN];
    if (!accessToken) {
      next(new Error('Token is required'));
      return;
    }
    const accessTokenPayload =
      await this.tokenService.verifyAccessToken(accessToken);
    if (!accessTokenPayload) {
      next(new Error('Invalid token'));
      return;
    }
    client.handshake.auth = accessTokenPayload;
    next();
  }
}
