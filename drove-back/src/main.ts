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
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  /** CORS (configurable por variables de entorno) **/
  const allowAllOrigins = (process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true';
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

  const corsMethods = (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    .split(',')
    .map(m => m.trim().toUpperCase())
    .filter(Boolean);
  const corsAllowedHeaders = (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,Accept,X-Requested-With,Origin')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean);
  const corsExposedHeaders = (process.env.CORS_EXPOSED_HEADERS || '')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean);
  const corsCredentials = (process.env.CORS_CREDENTIALS || 'true').toLowerCase() === 'true';
  const corsMaxAge = Number(process.env.CORS_MAX_AGE || 86400);
  const corsOptionsSuccessStatus = Number(process.env.CORS_OPTIONS_SUCCESS_STATUS || 204);

  app.enableCors({
    origin: allowAllOrigins ? true : originFn,
    credentials: corsCredentials,
    methods: corsMethods,
    allowedHeaders: corsAllowedHeaders,
    exposedHeaders: corsExposedHeaders.length ? corsExposedHeaders : undefined,
    optionsSuccessStatus: corsOptionsSuccessStatus,
    maxAge: corsMaxAge,
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
