import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';

import { AppModule } from './app.module';
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

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: '*' });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/', app, document, swaggerOptions);

  await app.listen(nestServerPort);
  Logger.log(
    `Server is running on: http://localhost:${nestServerPort}`,
    bootstrap.name
  );
}
bootstrap();
