import { IsNotEmpty, IsUUID } from 'class-validator';

export class MarkSeenMessageBodyDTO {
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;
}
