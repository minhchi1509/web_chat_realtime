import { Expose, Type } from 'class-transformer';

import { ConversationParticipantProfileDTO } from 'src/common/dto/ConversationParticipantResponse.dto';

export class GetChatMemberResponseDTO {
  @Expose()
  @Type(() => ConversationParticipantProfileDTO)
  profile: ConversationParticipantProfileDTO;

  @Expose()
  isOnline: boolean;
}
