import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy as GoogleStrategyBase,
  VerifyCallback
} from 'passport-google-oauth20';

import {
  EOAuthProvider,
  EStrategyName
} from 'src/common/constants/common.enum';
import { IRequest } from 'src/common/types/common.type';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import { TOAuthProfile } from 'src/common/types/token.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GoogleStrategyBase,
  EStrategyName.GOOGLE
) {
  constructor(
    private readonly configService: ConfigService<IEnvironmentVariables>
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_AUTH_CLIENT_ID') as string,
      clientSecret: configService.get<string>(
        'GOOGLE_AUTH_CLIENT_SECRET'
      ) as string,
      callbackURL: `${configService.get<string>('SERVER_BASE_URL')}/api/v1/oauth/google/redirect`,
      scope: ['email', 'profile'],
      passReqToCallback: true
    });
  }

  async validate(
    req: IRequest,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    const { id, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value;
    const avatarUrl = photos?.[0]?.value || '';
    if (!email || !avatarUrl) {
      return done(new Error('Invalid profile data from Google'), false);
    }
    const responseOAuthProfile: TOAuthProfile = {
      id,
      email,
      fullName: displayName,
      avatarUrl,
      provider: EOAuthProvider.GOOGLE,
      accessToken,
      refreshToken
    };
    req.oAuthProfile = responseOAuthProfile;
    done(null, responseOAuthProfile);
  }
}
