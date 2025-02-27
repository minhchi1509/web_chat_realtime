import { Expose } from 'class-transformer';

export class ConversationResponseDTO {
  @Expose()
  id: string;

  @Expose()
  name: string | null;

  @Expose()
  thumbnail: string | null;

  @Expose()
  isGroupChat: boolean;

  @Expose()
  createdAt: Date;
}
