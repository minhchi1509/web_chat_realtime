import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { EQueueName } from 'src/common/constants/job-queue.enum';
import { MailConsumer } from 'src/modules/libs/job-queue/mail-queue/providers/mail-queue.consumer';
import { MailQueueService } from 'src/modules/libs/job-queue/mail-queue/providers/mail-queue.service';

@Module({
  imports: [BullModule.registerQueue({ name: EQueueName.MAIL_QUEUE })],
  providers: [MailConsumer, MailQueueService],
  exports: [MailQueueService]
})
export class MailQueueModule {}
