import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { ConversationParticipant } from '@prisma/client';

import { TAppAbility } from 'src/common/types/policy.type';

@Injectable()
export class ConversationAbilityFactory {
  createForParticipant(participant: ConversationParticipant) {
    const { can, build } = new AbilityBuilder<TAppAbility>(createPrismaAbility);

    return build();
  }
}
