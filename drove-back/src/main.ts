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
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const whitelist = new Set<string>([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://drove-frontend-production.up.railway.app',
    ...envOrigins,
  ]);

  // Preflight handler to always answer OPTIONS with proper CORS headers
  app.use((req, res, next) => {
    const origin = (req.headers.origin as string) || '';
    if (req.method === 'OPTIONS' && (!origin || whitelist.has(origin))) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, X-Requested-With, Origin',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.sendStatus(204);
    }
    return next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (whitelist.has(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
    ],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: false,
    maxAge: 86400,
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
