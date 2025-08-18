import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { EQueueName } from 'src/common/constants/job-queue.enum';
import { CloudinaryModule } from 'src/modules/libs/cloudinary/cloudinary.module';
import { CloudinaryQueueConsumer } from 'src/modules/libs/job-queue/cloudinary-queue/providers/cloudinary-queue.consumer';
import { CloudinaryQueueService } from 'src/modules/libs/job-queue/cloudinary-queue/providers/cloudinary-queue.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: EQueueName.CLOUDINARY_QUEUE }),
    CloudinaryModule
  ],
  providers: [CloudinaryQueueService, CloudinaryQueueConsumer],
  exports: [CloudinaryQueueService]
})
export class CloudinaryQueueModule {}
