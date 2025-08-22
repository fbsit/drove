// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // para webhooks (Stripe, etc.)
  });

  // Confiar en proxy (Railway)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Handle OPTIONS requests FIRST - before any other middleware
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin as string | undefined;
      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        const reqHeaders = req.headers['access-control-request-headers'] as string ||
          'Content-Type, Authorization, Accept, X-Requested-With, Origin';
        res.header('Access-Control-Allow-Headers', reqHeaders);
        return res.sendStatus(204);
      }
    }
    return next();
  });

  // Echo CORS headers on all non-OPTIONS responses
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    return next();
  });

  /**
   * CORS global - this should come AFTER the custom OPTIONS handler
   */
  app.enableCors({
    origin: true,                 // refleja cualquier Origin permitido
    credentials: true,            // permite cookies/credenciales
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With','Origin'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  // Raw body SOLO para el webhook antes del parser JSON
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