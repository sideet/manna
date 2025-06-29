import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/ping')
  @ApiOperation({ summary: 'ping 테스트' })
  ping() {
    const env = this.configService.get<string>('env');
    return { env };
  }
}
