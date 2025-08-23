import { ApiProperty } from '@nestjs/swagger';
import { CallStatus, ESystemAction, MessageType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';
import { MessageEmotionResponseDTO } from 'src/common/dto/MessageEmotionResponse.dto';
import { MessageMediaResponseDTO } from 'src/common/dto/MessageMediaResponse.dto';

class ParentMessageResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @ApiProperty({ enum: MessageType })
  type: MessageType;

  @Expose()
  content: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  isRevokedForEveryone: boolean;

  @Expose()
  @Type(() => MessageMediaResponseDTO)
  mediaList: MessageMediaResponseDTO[];

  @Expose()
  @Type(() => ConversationParticipantResponseDTO)
  sender: ConversationParticipantResponseDTO | null;
}

export class MessageReactionsDataDTO {
  @Expose()
  total: number;

  @Expose()
  topReactions: string[];

  @Expose()
  @Type(() => MessageEmotionResponseDTO)
  data: MessageEmotionResponseDTO[];
}

export class ConversationMessageResponseDTO {
  @Expose()
  id: string;

  @Expose()
  @ApiProperty({ enum: MessageType })
  type: MessageType;

  @Expose()
  @ApiProperty({ enum: ESystemAction, nullable: true })
  systemAction: ESystemAction | null;

  @Expose()
  content: string | null;

  @Expose()
  @ApiProperty({ enum: CallStatus, nullable: true })
  callStatus: CallStatus | null;

  @Expose()
  callDuration: number | null;

  @Expose()
  createdAt: Date;

  @Expose()
  isRevokedForEveryone: boolean;

  @Expose()
  @Type(() => MessageMediaResponseDTO)
  mediaList: MessageMediaResponseDTO[];

  @Expose()
  @Type(() => MessageReactionsDataDTO)
  reactionsData: MessageReactionsDataDTO;

  @Expose()
  @Type(() => ParentMessageResponseDTO)
  replyToMessage: ParentMessageResponseDTO | null;

  @Expose()
  @Type(() => ConversationParticipantResponseDTO)
  sender: ConversationParticipantResponseDTO | null;
}
