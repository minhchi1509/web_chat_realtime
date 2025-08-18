import { Expose, Type } from 'class-transformer';

import { ConversationParticipantProfileDTO } from 'src/common/dto/ConversationParticipantResponse.dto';

export class SystemActionDetailResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ConversationParticipantProfileDTO)
  actor: ConversationParticipantProfileDTO;

  @Expose()
  @Type(() => ConversationParticipantProfileDTO)
  target: ConversationParticipantProfileDTO | null;

  @Expose()
  oldValue?: string;

  @Expose()
  newValue?: string;
}
