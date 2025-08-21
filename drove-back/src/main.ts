// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
      'https://test-drove.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true, // solo si envías cookies/headers auth
    optionsSuccessStatus: 204, // respuesta corta al pre-flight
  });
  app.use('/payments/webhook', express.raw({ type: 'application/json' }));

  /* Swagger */
  const config = new DocumentBuilder()
    .setTitle('Drove API')
    .setDescription('Documentación de la API de Drove')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Proveer token JWT en el header Authorization: Bearer <token>',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  logger.log(`Listening on port ${process.env.PORT ?? 3001}`);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
