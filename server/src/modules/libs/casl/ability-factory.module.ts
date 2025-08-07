import { Module } from '@nestjs/common';

import { ConversationAbilityFactory } from 'src/modules/libs/casl/factories/conversation.factory';

@Module({
  imports: [],
  providers: [ConversationAbilityFactory],
  exports: [ConversationAbilityFactory]
})
export class CaslAbilityFactoryModule {}
