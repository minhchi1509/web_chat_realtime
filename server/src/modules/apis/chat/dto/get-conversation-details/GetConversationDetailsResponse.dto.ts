import { Expose, Type } from 'class-transformer';

import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';
import { ConversationResponseDTO } from 'src/common/dto/ConversationResponse.dto';

export class ConversationDetailParticipant extends ConversationParticipantResponseDTO {
  @Expose()
  isOnline: boolean;

  @Expose()
  lastOnlineAt: Date | null;
}

export class GetConversationDetailsResponseDTO extends ConversationResponseDTO {
  @Expose()
  @Type(() => ConversationDetailParticipant)
  participants: ConversationDetailParticipant[];
}
