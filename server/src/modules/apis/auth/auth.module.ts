import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OAuthController } from 'src/modules/apis/auth/controllers/oauth.controller';
import { OAuthService } from 'src/modules/apis/auth/services/oauth.service';
import { BcryptModule } from 'src/modules/libs/bcrypt/bcrypt.module';
import { GoogleOAuthModule } from 'src/modules/libs/google-oauth/google-oauth.module';
import { MailQueueModule } from 'src/modules/libs/job-queue/mail-queue/mail-queue.module';
import {
  PrismaModule,
  PrismaModule as PrismaTestModule
} from 'src/modules/libs/prisma/prisma.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';
import { TokenModule } from 'src/modules/libs/token/token.module';

@Module({
  imports: [
    TokenModule,
    BcryptModule,
    MailQueueModule,
    RedisModule,
    PrismaTestModule,
    PrismaModule,
    GoogleOAuthModule,
    ConfigModule
  ],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, OAuthService]
})
export class AuthModule {}
