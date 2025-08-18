import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import {
  ECloudinaryJobName,
  EQueueName
} from 'src/common/constants/job-queue.enum';

@Injectable()
export class CloudinaryQueueService {
  constructor(
    @InjectQueue(EQueueName.CLOUDINARY_QUEUE)
    private cloudinaryQueue: Queue<string[]>
  ) {}

  deleteFiles = async (urls: string[]) => {
    const job = await this.cloudinaryQueue.add(
      ECloudinaryJobName.DELETE_FILES,
      urls
    );
    return job;
  };
}
