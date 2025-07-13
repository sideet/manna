import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './lib/database/prisma.service';
import * as services from './services';
import * as controllers from './controllers';
import * as repository from './lib/database/repository';
import { configuration } from './lib/common/config/configuration';
import * as commonUtil from './lib/common/utils';
import { ResponseInterceptor } from './lib/common/interceptors/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ``}`,
      load: [configuration],
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
  ],
  controllers: [...Object.values(controllers), AppController],
  providers: [
    ...Object.values(services),
    ...Object.values(repository),
    ...Object.values(commonUtil),
    AppService,
    ConfigService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
