import { Expose, Type } from 'class-transformer';

import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';
import { ConversationResponseDTO } from 'src/common/dto/ConversationResponse.dto';

class LastMessageResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ConversationParticipantResponseDTO)
  sender: ConversationParticipantResponseDTO;

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
