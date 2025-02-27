import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';

import { IEnvironmentVariables } from 'src/common/types/env.type';

@Injectable()
export class GoogleOAuthService {
  private oauthClient: Auth.OAuth2Client;

  constructor(private configService: ConfigService<IEnvironmentVariables>) {
    this.oauthClient = new google.auth.OAuth2({
      clientId: this.configService.get<string>('GOOGLE_AUTH_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_AUTH_CLIENT_SECRET')
    });
  }

  verifyIdToken = async (idToken: string): Promise<Auth.TokenPayload> => {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('GOOGLE_AUTH_CLIENT_ID')
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException('Invalid Google id token');
    }
    return payload;
  };
}
