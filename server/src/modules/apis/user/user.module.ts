import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { UserController } from 'src/modules/apis/user/user.controller';
import { UserService } from 'src/modules/apis/user/user.service';
import { BcryptModule } from 'src/modules/libs/bcrypt/bcrypt.module';
import { CloudinaryModule } from 'src/modules/libs/cloudinary/cloudinary.module';
import { CookiesModule } from 'src/modules/libs/cookies/cookies.module';
import { PrismaModule } from 'src/modules/libs/prisma/prisma.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';

@Module({
  imports: [
    BcryptModule,
    PrismaModule,
    CloudinaryModule,
    NestjsFormDataModule,
    RedisModule,
    CookiesModule
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
