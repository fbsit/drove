// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Confía en proxy (Railway)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // === CORS manual robusto (colócalo PRIMERO) ===
  const allowlist = new Set<string>([
    'https://drove.up.railway.app',                   // tu front
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL || '',
    process.env.FRONTEND_URL_2 || ''
  ].filter(Boolean));

  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    // Permite Postman/cURL (sin Origin)
    const isAllowed =
      !origin ||
      allowlist.has(origin) ||
      // opcional: permitir cualquier *.railway.app
      (origin && /\.railway\.app$/.test(new URL(origin).hostname));

    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }

    // Refleja exactamente lo que pide el navegador en la preflight
    const reqHeaders = req.headers['access-control-request-headers'] as string | undefined;
    if (reqHeaders) {
      res.setHeader('Access-Control-Allow-Headers', reqHeaders);
    } else {
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, X-Requested-With, Origin'
      );
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });
  // === Fin CORS manual ===

  // Seguridad/Compresión
  app.use(helmet());
  app.use(compression());

  // Webhook raw (Stripe u otros)
  app.use('/payments/webhook', express.raw({ type: 'application/json' }));

  // Validaciones globales
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger si quieres (no afecta CORS)

  const port = Number(process.env.PORT) || 3001;
  logger.log(`Listening on port ${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
