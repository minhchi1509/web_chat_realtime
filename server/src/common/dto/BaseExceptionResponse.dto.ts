import { Expose } from 'class-transformer';

export class BaseExceptionResponse {
  @Expose()
  statusCode: number;

  @Expose()
  message: string;

  @Expose()
  errors: any | null;

  @Expose()
  path: string;
}
