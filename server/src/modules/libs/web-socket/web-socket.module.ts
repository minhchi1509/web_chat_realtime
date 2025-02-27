import { forwardRef, Module } from '@nestjs/common';

import { WebSocketMiddleware } from 'src/common/middlewares/websocket.middleware';
import { ChatModule } from 'src/modules/apis/chat/chat.module';
import { PrismaModule } from 'src/modules/libs/prisma/prisma.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';
import { TokenModule } from 'src/modules/libs/token/token.module';
import { ChatGateway } from 'src/modules/libs/web-socket/gateways/chat.gateway';

@Module({
  imports: [
    TokenModule,
    RedisModule,
    PrismaModule,
    forwardRef(() => ChatModule)
  ],
  providers: [ChatGateway, WebSocketMiddleware],
  exports: [ChatGateway]
})
export class WebSocketModule {}
