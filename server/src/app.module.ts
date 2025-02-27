import { BullModule } from '@nestjs/bull';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import EnvironmentVariablesValidationSchema from 'src/common/configs/env.config';
import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AppClassSerializerInterceptor } from 'src/common/interceptors/app-class-serializer.interceptor';
import { AppValidationPipe } from 'src/common/pipes/app-validation.pipe';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import { AuthModule } from 'src/modules/apis/auth/auth.module';
import { ChatModule } from 'src/modules/apis/chat/chat.module';
import { UserModule } from 'src/modules/apis/user/user.module';
import { TokenModule } from 'src/modules/libs/token/token.module';
import { WebSocketModule } from 'src/modules/libs/web-socket/web-socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: EnvironmentVariablesValidationSchema
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IEnvironmentVariables>) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD')
          }
        },
        defaults: {
          from: `"Web Chat System" <no-reply@google.com>`
        },
        template: {
          dir: join(__dirname, 'common/assets/mail-templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IEnvironmentVariables>) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD')
        }
      }),
      inject: [ConfigService]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'common/assets/static'),
      serveRoot: '/public/static'
    }),
    TokenModule,
    UserModule,
    AuthModule,
    ChatModule,
    WebSocketModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: AppValidationPipe },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: AppClassSerializerInterceptor },
    Logger
  ]
})
export class AppModule {}
