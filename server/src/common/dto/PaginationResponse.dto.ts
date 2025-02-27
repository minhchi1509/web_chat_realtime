/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ApiHideProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PaginationResponseDTO<T> {
  @ApiHideProperty()
  private type?: Function;

  @Expose()
  currentPage: number;

  @Expose()
  totalPage: number;

  @Expose()
  pageSize: number;

  @Expose()
  hasNextPage: boolean;

  @Expose()
  @Type((options) => options?.newObject.type)
  data: T[];

  constructor(type: Function) {
    this.type = type;
  }
}
