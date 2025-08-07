import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import {
  Conversation,
  ConversationParticipant,
  Message,
  MessageMedia
} from '@prisma/client';

import { IRequest } from 'src/common/types/common.type';

type TAppAbilitySubjects =
  | Subjects<{
      Conversation: Conversation;
      Message: Message;
      MessageMedia: MessageMedia;
      ConversationParticipant: ConversationParticipant;
    }>
  | 'all';

export type TAppAbility = PureAbility<
  [string, TAppAbilitySubjects],
  PrismaQuery
>;

export interface IPolicyHandler {
  handle(ability: TAppAbility, request: IRequest): Promise<boolean>;
}
