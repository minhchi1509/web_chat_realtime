import { Expose } from 'class-transformer';

import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';

export class CreatedPrivateChatResponseDTO extends MessageResponseDTO {
  @Expose()
  createdConversationId: string;
}
