import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { FormDataRequest } from 'nestjs-form-data';

import { BaseExceptionResponse } from 'src/common/dto/BaseExceptionResponse.dto';
import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';

export const UseFormData = () => {
  return applyDecorators(ApiConsumes('multipart/form-data'), FormDataRequest());
};

export const ApiExceptionResponse = (options?: {
  type: Type<unknown>;
  status?: HttpStatus;
}) => {
  return applyDecorators(
    ApiResponse({
      type: options?.type || BaseExceptionResponse,
      status: options?.status || '4XX',
      description: 'Exception'
    })
  );
};

export const ApiOkResponsePaginated = <DataDTO extends Type<unknown>>(
  dataDto: DataDTO
) =>
  applyDecorators(
    ApiExtraModels(PaginationResponseDTO, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDTO) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) }
              }
            }
          }
        ]
      }
    })
  );
