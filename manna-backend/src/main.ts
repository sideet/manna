import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  if (process.env.PORT !== 'production') {
    const config = new DocumentBuilder().setTitle('Manna-API').setDescription('The manna API description').setVersion('1.0').addTag('manna').addBearerAuth().build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('manna/api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 4030);
}
bootstrap();
