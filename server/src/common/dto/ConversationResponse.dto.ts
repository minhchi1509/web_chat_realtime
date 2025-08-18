import { Expose } from 'class-transformer';

export class ConversationResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  thumbnail: string;

  @Expose()
  isGroupChat: boolean;

  @Expose()
  createdAt: Date;
}
