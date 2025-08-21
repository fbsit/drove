// src/rates/prices.module.ts
import { Module } from '@nestjs/common';
import { PricingService } from './prices.service';
import { PricesController } from './prices.controller';

@Module({
  controllers: [PricesController],
  providers: [PricingService],
  exports: [PricingService], // <-- añade esto
})
export class PricesModule {}
