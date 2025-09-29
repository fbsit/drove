import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from './middleware';
import { TravelsModule } from './travels/travels.module';
import { InvoicesModule } from './invoices/invoices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { PricesModule } from './rates/prices.module';
import { AdminModule } from './admin/admin.module';
import { VerificationsModule } from './verifications/verifications.module';
import { ResendModule } from './resend/resend.module';
import { PaymentsModule } from './payment/payment.module';
import { PdfModule } from './pdf/pdf.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SupportModule } from './tickets/support.module';
import { join } from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CarDataModule } from './cardata/cardata.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 60,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const hasDatabaseUrl = !!process.env.DATABASE_URL;
        const synchronize = process.env.TYPEORM_SYNC
          ? process.env.TYPEORM_SYNC.toLowerCase() === 'true'
          : process.env.NODE_ENV !== 'production';
        if (hasDatabaseUrl) {
          return {
            type: 'postgres' as const,
            url: process.env.DATABASE_URL,
            ssl:
              process.env.PGSSL?.toLowerCase() === 'true'
                ? { rejectUnauthorized: false }
                : false,
            entities: [join(__dirname, '/**/*.entity.{ts,js}')],
            autoLoadEntities: true,
            synchronize,
            logging: process.env.TYPEORM_LOGGING?.toLowerCase() === 'true',
          };
        }
        return {
          type: 'postgres' as const,
          host: process.env.PGHOST || 'localhost',
          port: +(process.env.PGPORT || 5432),
          username: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || '',
          database: process.env.PGDATABASE || 'drove',
          ssl:
            process.env.PGSSL?.toLowerCase() === 'true'
              ? { rejectUnauthorized: false }
              : false,
          entities: [join(__dirname, '/**/*.entity.{ts,js}')],
          autoLoadEntities: true,
          synchronize,
          logging: process.env.TYPEORM_LOGGING?.toLowerCase() === 'true',
        };
      },
    }),
    AuthModule,
    SupportModule,
    UserModule,
    ResendModule,
    TravelsModule,
    VerificationsModule,
    AdminModule,
    PricesModule,
    ReviewsModule,
    StorageModule,
    NotificationsModule,
    InvoicesModule,
    PaymentsModule,
    PdfModule,
    CarDataModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'auth/login', method: RequestMethod.ALL })
      .exclude({ path: 'users', method: RequestMethod.ALL })
      .exclude({ path: 'users/forgot-password', method: RequestMethod.ALL })
      .exclude({ path: 'users/reset-password', method: RequestMethod.ALL })
      .exclude({ path: 'storage/upload/drover', method: RequestMethod.ALL })
      .exclude({
        path: 'verifications/email/send-code',
        method: RequestMethod.ALL,
      })
      .exclude({
        path: 'verifications/email/check-code',
        method: RequestMethod.ALL,
      })
      .exclude({
        path: 'support/tickets',
        method: RequestMethod.ALL,
      })
      .exclude({
        path: 'pdf',
        method: RequestMethod.ALL,
      })
      .exclude({
        path: 'payments/webhook',
        method: RequestMethod.ALL,
      })
      .exclude({ path: '*', method: RequestMethod.OPTIONS })
      .forRoutes('*');
  }
}
