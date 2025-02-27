import { forwardRef, Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { ChatController } from 'src/modules/apis/chat/chat.controller';
import { ChatService } from 'src/modules/apis/chat/chat.service';
import { CloudinaryModule } from 'src/modules/libs/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/modules/libs/prisma/prisma.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';
import { WebSocketModule } from 'src/modules/libs/web-socket/web-socket.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    NestjsFormDataModule,
    CloudinaryModule,
    forwardRef(() => WebSocketModule)
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
