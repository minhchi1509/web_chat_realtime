import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from 'src/modules/libs/prisma/prisma.module';
import { RedisProvider } from 'src/modules/libs/redis/redis.provider';
import { RedisService } from 'src/modules/libs/redis/redis.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [RedisProvider, RedisService],
  exports: [RedisService]
})
export class RedisModule {}
