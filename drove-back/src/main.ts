// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // para webhooks
  });

  // Confiar en proxy (Railway)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  /** CORS (simple y directo) **/
  const WHITELIST = new Set<string>([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://drove-frontend-production.up.railway.app',
  ]);

  const PATTERNS: RegExp[] = [
    /^https?:\/\/localhost:\d+$/,
    /^https?:\/\/127\.0\.0\.1:\d+$/,
    /^https:\/\/.*\.up\.railway\.app$/, // cualquier subdominio de Railway
  ];

  const originFn = (
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return cb(null, true); // peticiones server-to-server
    if (WHITELIST.has(origin) || PATTERNS.some(re => re.test(origin))) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  };

  app.enableCors({
    origin: originFn,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  // Raw body SOLO para el webhook (antes del parser JSON)
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
