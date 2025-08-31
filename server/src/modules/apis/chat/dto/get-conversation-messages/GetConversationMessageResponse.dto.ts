import { Expose, Type } from 'class-transformer';

import { ConversationMessageResponseDTO } from 'src/common/dto/ConversationMessageResponse.dto';
import { ConversationParticipantResponseDTO } from 'src/common/dto/ConversationParticipantResponse.dto';

export class ParticipantSeenMessageResponseDTO extends ConversationParticipantResponseDTO {
  @Expose()
  seenAt: Date;
}

export class LinkMetadata {
  @Expose()
  url: string;

  @Expose()
  title: string | null;

  @Expose()
  description: string | null;

  @Expose()
  imageUrl: string | null;
}

export class ActionsOnMessageDTO {
  @Expose()
  canRevoke: boolean;

  @Expose()
  canReply: boolean;

  @Expose()
  canDropEmotion: boolean;
}

export class GetConversationMessageResponseDTO extends ConversationMessageResponseDTO {
  @Expose()
  @Type(() => ParticipantSeenMessageResponseDTO)
  seenBy: ParticipantSeenMessageResponseDTO[];

  @Expose()
  @Type(() => LinkMetadata)
  linkMetadata: LinkMetadata | null;

  @Expose()
  @Type(() => ActionsOnMessageDTO)
  actionsOnMessage: ActionsOnMessageDTO;
}
