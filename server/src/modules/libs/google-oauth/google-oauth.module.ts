import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GoogleOAuthService } from 'src/modules/libs/google-oauth/google-oauth.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService]
})
export class GoogleOAuthModule {}
