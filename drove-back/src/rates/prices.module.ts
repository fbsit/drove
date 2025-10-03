// src/rates/prices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './prices.service';
import { PricesController } from './prices.controller';
import { CompensationService } from './compensation.service';
import { CompensationController } from './compensation.controller';
import { Travels } from '../travels/entities/travel.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Travels, User])],
  controllers: [PricesController, CompensationController],
  providers: [PricingService, CompensationService],
  exports: [PricingService, CompensationService],
})
export class PricesModule {}
