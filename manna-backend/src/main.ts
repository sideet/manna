import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './lib/common/exceptions/customException-filter';
import { ConfigService } from '@nestjs/config';
import { CommonUtil } from './lib/common/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.PORT === 'production' ? ['https://manna.it.kr'] : true,
    credentials: true,
  });

  app.useGlobalFilters(
    new CustomExceptionFilter(
      app.get(ConfigService),
      app.get(HttpAdapterHost),
      app.get(CommonUtil)
    )
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  if (process.env.PORT !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Manna-API')
      .setDescription('The manna API description')
      .setVersion('1.0')
      .addTag('manna')
      .addBearerAuth()
      .addCookieAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('manna/api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 4030);
}
bootstrap();
