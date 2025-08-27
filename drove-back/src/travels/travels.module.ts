// src/travels/travels.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Travels } from './entities/travel.entity';
import { Payment } from '../payment/entities/payment.entity';
import { TravelsService } from './travels.service';
import { TravelsController } from './travels.controller';
import { InvoicesModule } from '../invoices/invoices.module';
import { StripeService } from '../payment/stripe.service';
import { ResendModule } from '../resend/resend.module';
import { TravelOffer } from './entities/travel-offer.entity';
import { TravelsGateway } from './travel.gateway';
import { User } from '../user/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Travels, Payment, TravelOffer, User]), // ← aquí agregamos Payment
    InvoicesModule,
    ResendModule,
    NotificationsModule,
  ],
  controllers: [TravelsController],
  providers: [TravelsService, TravelsGateway, StripeService],
  exports: [TravelsService],
})
export class TravelsModule {}
