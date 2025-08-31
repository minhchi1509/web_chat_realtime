import { Module } from '@nestjs/common';

import { SocketEventEmitterService } from './socket-event-emitter.service';
import { WebSocketMiddleware } from 'src/common/middlewares/websocket.middleware';
import { PrismaModule } from 'src/modules/libs/prisma/prisma.module';
import { RedisModule } from 'src/modules/libs/redis/redis.module';
import { StrategyModule } from 'src/modules/libs/strategies/strategy.module';
import { TokenModule } from 'src/modules/libs/token/token.module';
import { ChatGateway } from 'src/modules/web-socket/chat/chat.gateway';
import { ChatSocketService } from 'src/modules/web-socket/chat/chat-socket.service';

@Module({
  imports: [RedisModule, PrismaModule, StrategyModule, TokenModule],
  providers: [
    ChatGateway,
    ChatSocketService,
    WebSocketMiddleware,
    SocketEventEmitterService
  ],
  exports: [ChatSocketService]
})
export class ChatSocketModule {}
