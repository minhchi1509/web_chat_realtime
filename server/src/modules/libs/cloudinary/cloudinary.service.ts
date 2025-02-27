import { Injectable } from '@nestjs/common';
import base64url from 'base64url';
import { UploadApiOptions, UploadApiResponse, v2 } from 'cloudinary';
import { MemoryStoredFile } from 'nestjs-form-data';
import * as streamifier from 'streamifier';

import { RedisService } from 'src/modules/libs/redis/redis.service';

@Injectable()
export class CloudinaryService {
  constructor(private redisService: RedisService) {}

  uploadFile = async (
    file: MemoryStoredFile,
    options?: UploadApiOptions
  ): Promise<UploadApiResponse> => {
    const uploadResponse: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        const upload = v2.uploader.upload_stream(options, (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result!);
        });
        streamifier.createReadStream(file.buffer).pipe(upload);
      }
    );
    const { secure_url: url, public_id: publicId } = uploadResponse;
    const encodeURL = base64url.encode(url);
    await this.redisService.setFilePublicId(encodeURL, publicId);
    return uploadResponse;
  };

  deleteFileByPublicId = async (publicId: string): Promise<void> => {
    await v2.uploader.destroy(publicId);
  };

  deleteFileByUrl = async (url: string): Promise<void> => {
    const encodeURL = base64url.encode(url);
    const filePublicId = await this.redisService.getFilePublicId(encodeURL);
    if (filePublicId) {
      await this.deleteFileByPublicId(filePublicId);
      await this.redisService.deleteFilePublicId(encodeURL);
    }
  };

  getFileInfo = async (
    publicId: string
  ): Promise<UploadApiResponse | undefined> => {
    try {
      const fileResource: UploadApiResponse = await v2.api.resource(publicId);
      return fileResource;
    } catch (error) {
      return undefined;
    }
  };
}
