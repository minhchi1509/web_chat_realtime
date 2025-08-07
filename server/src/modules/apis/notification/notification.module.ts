import { Module } from '@nestjs/common';

import { NotificationController } from 'src/modules/apis/notification/notification.controller';
import { NotificationService } from 'src/modules/apis/notification/notification.service';
import { RedisModule } from 'src/modules/libs/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}
