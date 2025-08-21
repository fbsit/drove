// src/travels/travels.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Travels } from './entities/travel.entity';
import { Payment } from '../payment/entities/payment.entity';
import { TravelsService } from './travels.service';
import { TravelsController } from './travels.controller';
import { InvoicesModule } from '../invoices/invoices.module';
import { StripeService } from '../payment/stripe.service';
import { ResendService } from '../resend/resend.service';
import { TravelOffer } from './entities/travel-offer.entity';
import { TravelsGateway } from './travel.gateway';
import { User } from '../user/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Travels, Payment, TravelOffer, User]), // ← aquí agregamos Payment
    InvoicesModule,
  ],
  controllers: [TravelsController],
  providers: [TravelsService, TravelsGateway, StripeService, ResendService],
  exports: [TravelsService],
})
export class TravelsModule {}
