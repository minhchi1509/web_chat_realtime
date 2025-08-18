import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { EMailJobName, EQueueName } from 'src/common/constants/job-queue.enum';
import { TResetPasswordMailData } from 'src/common/types/mail.type';

@Injectable()
export class MailQueueService {
  constructor(
    @InjectQueue(EQueueName.MAIL_QUEUE)
    private emailQueue: Queue<TResetPasswordMailData>
  ) {}

  sendResetPasswordMail = async (data: TResetPasswordMailData) => {
    const job = await this.emailQueue.add(EMailJobName.RESET_PASSWORD, data);
    return job;
  };
}
