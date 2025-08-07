import { ContextType, HttpException, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
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

export const throwErrorByContextType = (
  contextType: ContextType,
  response: string | object,
  httpOptions?: {
    statusCode?: HttpStatus;
  }
) => {
  if (contextType === 'http') {
    throw new HttpException(
      response,
      httpOptions?.statusCode ?? HttpStatus.BAD_REQUEST
    );
  } else if (contextType === 'ws') {
    throw new WsException(response);
  }
  throw new Error('Unknown context type');
};
