import { Expose } from 'class-transformer';

export class BaseExceptionResponse {
  @Expose()
  statusCode: number;

  @Expose()
  message: string;

  @Expose()
  details: any | null;

  @Expose()
  path: string;
}
