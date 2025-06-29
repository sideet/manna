import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatebaseModule } from 'app/src/lib/database/database.module';

@Module({
  imports: [DatebaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
