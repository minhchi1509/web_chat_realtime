import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EStrategyName } from 'src/common/constants/common.enum';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(EStrategyName.GOOGLE) {
  constructor() {
    super({
      accessType: 'offline',
      prompt: 'consent'
    });
  }

  handleRequest<TOAuthProfile>(_err: Error, user: TOAuthProfile) {
    if (!user) {
      throw new UnauthorizedException('Invalid google credentials');
    }
    return user;
  }
}
