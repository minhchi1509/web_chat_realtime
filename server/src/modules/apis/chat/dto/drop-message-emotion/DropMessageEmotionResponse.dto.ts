import { Expose, Type } from 'class-transformer';

import { MessageEmotionResponseDTO } from 'src/common/dto/MessageEmotionResponse.dto';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';

export class DropMessageEmotionResponseDTO extends MessageResponseDTO {
  @Expose()
  @Type(() => MessageEmotionResponseDTO)
  droppedEmotion: MessageEmotionResponseDTO;
}
