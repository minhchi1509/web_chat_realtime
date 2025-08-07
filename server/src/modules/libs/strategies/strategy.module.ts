import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GoogleStrategy } from 'src/modules/libs/strategies/google.strategy';
import { JwtStrategy } from 'src/modules/libs/strategies/jwt.strategy';
import { SocketJwtStrategy } from 'src/modules/libs/strategies/socket-jwt.strategy';

@Module({
  imports: [ConfigModule],
  providers: [JwtStrategy, SocketJwtStrategy, GoogleStrategy],
  exports: [JwtStrategy, SocketJwtStrategy, GoogleStrategy]
})
export class StrategyModule {}
