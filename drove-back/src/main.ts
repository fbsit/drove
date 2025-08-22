// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });

  /* CORS */
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:8080/registro',
      'http://127.0.0.1:8080',
      'https://drove.up.railway.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept, Access-Control-Allow-Origin',
    credentials: true, // solo si envías cookies/headers auth
    optionsSuccessStatus: 204, // respuesta corta al pre-flight
  });
  app.use('/payments/webhook', express.raw({ type: 'application/json' }));
  logger.log(`Listening on port ${process.env.PORT ?? 3001}`);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
