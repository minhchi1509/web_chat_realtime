import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import {
  ECloudinaryJobName,
  EQueueName
} from 'src/common/constants/job-queue.enum';
import { CloudinaryService } from 'src/modules/libs/cloudinary/cloudinary.service';

@Processor(EQueueName.CLOUDINARY_QUEUE)
export class CloudinaryQueueConsumer {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Process(ECloudinaryJobName.DELETE_FILES)
  async deleteFiles(job: Job<string[]>) {
    const { data } = job;
    await Promise.all(
      data.map((fileUrl) => this.cloudinaryService.deleteFileByUrl(fileUrl))
    );
  }
}
