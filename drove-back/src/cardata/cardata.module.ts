import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CarDataService } from './cardata.service';
import { CarDataController } from './cardata.controller';
import { CarApiClient } from './carapi.client';
import { CarMake } from './entities/make.entity';
import { CarModel } from './entities/model.entity';
import { CarTrim } from './entities/trim.entity';
import { VinDecode } from './entities/vin-decode.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CarMake, CarModel, CarTrim, VinDecode]),
  ],
  controllers: [CarDataController],
  providers: [CarDataService, CarApiClient],
  exports: [CarDataService],
})
export class CarDataModule {}


