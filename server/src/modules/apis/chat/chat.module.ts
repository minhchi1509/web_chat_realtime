import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { ChatController } from 'src/modules/apis/chat/chat.controller';
import { ChatService } from 'src/modules/apis/chat/chat.service';
import { CaslAbilityFactoryModule } from 'src/modules/libs/casl/ability-factory.module';
import { CloudinaryModule } from 'src/modules/libs/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/modules/libs/prisma/prisma.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';
import { ChatSocketModule } from 'src/modules/web-socket/chat/chat-socket.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    NestjsFormDataModule,
    CloudinaryModule,
    ChatSocketModule,
    CaslAbilityFactoryModule
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
