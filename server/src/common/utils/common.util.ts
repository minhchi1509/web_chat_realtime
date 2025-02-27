import { MessageMediaType } from '@prisma/client';
import { ClassConstructor, plainToClassFromExist } from 'class-transformer';

import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';

export const plainToInstancePaginationResponse = <T>(
  classType: ClassConstructor<T>,
  responseData: unknown
) => {
  return plainToClassFromExist(
    new PaginationResponseDTO<T>(classType),
    responseData
  );
};

export const getMediaType = (mimeType: string): MessageMediaType => {
  if (mimeType.startsWith('image/')) {
    return 'PHOTO';
  } else if (mimeType.startsWith('video/')) {
    return 'VIDEO';
  } else if (mimeType.startsWith('audio/')) {
    return 'AUDIO';
  }
  return 'FILE';
};
