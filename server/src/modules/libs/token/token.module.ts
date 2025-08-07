import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { CookiesModule } from 'src/modules/libs/cookies/cookies.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';
import { TokenService } from 'src/modules/libs/token/token.service';

@Module({
  imports: [JwtModule.register({}), ConfigModule, RedisModule, CookiesModule],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
