import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ECookieName, EStrategyName } from 'src/common/constants/common.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import { TJWTPayload } from 'src/common/types/token.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  EStrategyName.JWT_HTTP
) {
  constructor(
    private readonly configService: ConfigService<IEnvironmentVariables>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.[ECookieName.ACCESS_TOKEN] || null
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET') as string
    });
  }

  async validate(payload: TJWTPayload) {
    return payload;
  }
}
