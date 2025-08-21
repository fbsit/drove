import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { PaymentsController } from './payment.controller';
import { TravelsModule } from './../travels/travels.module'; // para actualizar estados

@Module({
  imports: [ConfigModule, TravelsModule],
  providers: [StripeService],
  controllers: [PaymentsController],
  exports: [StripeService],
})
export class PaymentsModule {}
