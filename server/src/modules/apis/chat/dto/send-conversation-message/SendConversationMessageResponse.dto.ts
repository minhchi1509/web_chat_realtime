import { Expose, Type } from 'class-transformer';

import { ConversationMessageResponseDTO } from 'src/common/dto/ConversationMessageResponse.dto';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';

export class SendConversationMessageResponseDTO extends MessageResponseDTO {
  @Expose()
  @Type(() => ConversationMessageResponseDTO)
  sentMessage: ConversationMessageResponseDTO;
}
