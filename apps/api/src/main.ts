import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('UFitPal API')
    .setDescription('The UFitPal API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: [
      process.env.UFITPAL_FRONT,
      process.env.UFITPAL_DASH,
      'http://localhost:8000', // Your frontend's origin
      'http://localhost:9000',
    ],
    /*     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'], */
    credentials: true, // optional if you use cookies
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- important
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.use(cookieParser());
  app.use(express.static('uploads'));
  /*   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    }); */
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
