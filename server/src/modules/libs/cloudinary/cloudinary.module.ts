import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CloudinaryProvider } from 'src/modules/libs/cloudinary/cloudinary.provider';
import { CloudinaryService } from 'src/modules/libs/cloudinary/cloudinary.service';
import { RedisModule } from 'src/modules/libs/redis/redis.module';

@Module({
  imports: [RedisModule, ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}
