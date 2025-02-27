import { Expose, Type } from 'class-transformer';

import { ConversationResponseDTO } from 'src/common/dto/ConversationResponse.dto';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';

export class CreatePrivateChatResponseDTO extends MessageResponseDTO {
  @Expose()
  @Type(() => ConversationResponseDTO)
  createdConversation: ConversationResponseDTO;
}
