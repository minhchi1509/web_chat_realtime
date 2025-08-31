import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';

import { AppModule } from './app.module';
import swaggerMetadata from './metadata';
import { winstonLogger } from 'src/common/configs/logger.config';
import {
  swaggerConfig,
  swaggerOptions
} from 'src/common/configs/swagger.config';
import { IEnvironmentVariables } from 'src/common/types/env.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance: winstonLogger })
  });
  const configService = app.get(ConfigService<IEnvironmentVariables>);
  const nestServerPort = configService.get<number>('NEST_SERVER_PORT')!;
  const serverHost = configService.get<string>('SERVER_BASE_URL')!;

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: ['http://localhost:3000', 'https://web-chat.minhchi.id.vn'],
    credentials: true
  });
  app.use(cookieParser());

  await SwaggerModule.loadPluginMetadata(swaggerMetadata);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/swagger', app, document, swaggerOptions);

  await app.listen(nestServerPort);
  Logger.log(`Server is running on: ${serverHost}`, bootstrap.name);
}
bootstrap();
