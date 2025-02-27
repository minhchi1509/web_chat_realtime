import { Process, Processor } from '@nestjs/bull';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';

import { EMailJobName, EQueueName } from 'src/common/constants/job-queue.enum';
import { TResetPasswordMailData } from 'src/common/types/mail.type';

@Processor(EQueueName.MAIL_QUEUE)
export class MailConsumer {
  constructor(private mailService: MailerService) {}

  @Process(EMailJobName.RESET_PASSWORD)
  async sendResetPasswordMail(job: Job<TResetPasswordMailData>) {
    const { data } = job;
    await this.mailService.sendMail({
      to: data.to,
      subject: 'Reset your password',
      template: './reset-password',
      context: data.context
    });
    console.log('Reset password mail has been sent successfully!');
  }
}
