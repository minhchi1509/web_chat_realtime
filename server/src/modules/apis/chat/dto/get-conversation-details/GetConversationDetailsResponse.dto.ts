import { Expose } from 'class-transformer';

import { ConversationResponseDTO } from 'src/common/dto/ConversationResponse.dto';

export class GetConversationDetailsResponseDTO extends ConversationResponseDTO {
  @Expose()
  isOnline: boolean;
}
