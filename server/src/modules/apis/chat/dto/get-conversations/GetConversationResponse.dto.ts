import { Expose, Type } from 'class-transformer';

import { ConversationResponseDTO } from 'src/common/dto/ConversationResponse.dto';

class LastMessageResponseDTO {
  @Expose()
  id: string;

  @Expose()
  isSeen: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  previewContent: string;
}

export class GetConversationResponseDTO extends ConversationResponseDTO {
  @Expose()
  @Type(() => LastMessageResponseDTO)
  lastMessage: LastMessageResponseDTO;

  @Expose()
  isOnline: boolean;
}
