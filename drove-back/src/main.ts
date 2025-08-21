// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,   // para webhooks
  });

  // Confía en el proxy de Railway para que no pierdas headers
  app.set('trust proxy', 1);

  /** CORS **/
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Lista explícita + patrones (localhost y *.railway.app)
  const whitelist = new Set<string>([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://drove-frontend-production.up.railway.app',
    ...envOrigins,
  ]);

  const allowedPatterns: RegExp[] = [
    /^https?:\/\/localhost:\d+$/,
    /^https?:\/\/127\.0\.0\.1:\d+$/,
    /^https:\/\/.*\.up\.railway\.app$/,
  ];

  const originFn = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return cb(null, true); // fetch desde backend o curl
    if (whitelist.has(origin) || allowedPatterns.some((re) => re.test(origin))) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  };

  app.enableCors({
    origin: originFn,
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With','Origin'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  // IMPORTANTE: registra el raw body SOLO en el webhook antes del body-parser JSON
  app.use('/payments/webhook', express.raw({ type: 'application/json' }));

  /** Swagger **/
  const config = new DocumentBuilder()
    .setTitle('Drove API')
    .setDescription('Documentación de la API de Drove')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT) || 3001;
  logger.log(`Listening on port ${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
