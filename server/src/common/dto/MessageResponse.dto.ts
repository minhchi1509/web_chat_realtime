import { Expose } from 'class-transformer';

export class MessageResponseDTO {
  @Expose()
  message: string;
}
