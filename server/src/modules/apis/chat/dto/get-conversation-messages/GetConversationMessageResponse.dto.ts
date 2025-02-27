import { Expose, Type } from 'class-transformer';

import { ConversationMessageResponseDTO } from 'src/common/dto/ConversationMessageResponse.dto';
import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';

class ParticipantSeenMessageResponseDTO extends ConversationParticipantResponseDTO {
  @Expose()
  seenAt: Date;
}

export class GetConversationMessageResponseDTO extends ConversationMessageResponseDTO {
  @Expose()
  @Type(() => ParticipantSeenMessageResponseDTO)
  seenBy: ParticipantSeenMessageResponseDTO[];

  @Expose()
  isShowSeperateTime: boolean;
}
