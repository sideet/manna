import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './lib/database/prisma.service';
import * as services from './services';
import * as controllers from './controllers';
import * as repository from './lib/database/repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ``}`,
      load: [],
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
  ],
  controllers: [...Object.values(controllers), AppController],
  providers: [...Object.values(services), ...Object.values(repository), AppService, ConfigService, PrismaService],
})
export class AppModule {}
