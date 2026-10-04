import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
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

  const corsOrigins = [
    process.env.UFITPAL_FRONT,
    process.env.UFITPAL_DASH,
  ].filter((origin): origin is string => Boolean(origin));

  if (process.env.NODE_ENV !== 'production') {
    corsOrigins.push('http://localhost:8000', 'http://localhost:9000');
  }

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- important
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  // Uploads are served by ServeStaticModule at /uploads (see app.module.ts).
  // crossOriginResourcePolicy is relaxed so the storefront can load those images.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
