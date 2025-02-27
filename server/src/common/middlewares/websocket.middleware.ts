import { Injectable } from '@nestjs/common';
import { ExtendedError, Socket } from 'socket.io';

import { TokenService } from 'src/modules/libs/token/token.service';

@Injectable()
export class WebSocketMiddleware {
  constructor(private tokenService: TokenService) {}

  async verifyClient(client: Socket, next: (err?: ExtendedError) => void) {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' && token ? token : undefined;
    if (!accessToken) {
      // client.disconnect();
      next(new Error('Token is required'));
      return;
    }
    const accessTokenPayload =
      await this.tokenService.verifyAccessToken(accessToken);
    if (!accessTokenPayload) {
      // client.disconnect();
      next(new Error('Invalid token'));
      return;
    }
    client.handshake.auth = accessTokenPayload;
    next();
  }
}
