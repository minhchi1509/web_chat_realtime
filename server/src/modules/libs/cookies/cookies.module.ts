import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CookiesService } from 'src/modules/libs/cookies/cookies.service';

@Module({
  imports: [ConfigModule],
  providers: [CookiesService],
  exports: [CookiesService]
})
export class CookiesModule {}
