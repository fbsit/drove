// src/pdf/pdf.module.ts
import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ConfigModule } from '@nestjs/config';
import { PricesModule } from './../rates/prices.module';
import { RoutesModule } from './../routes/routes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './../user/entities/user.entity';
import { Travels } from './../travels/entities/travel.entity';
import { PdfController } from './pdf.controller';

@Module({
  imports: [
    ConfigModule,
    PricesModule,
    RoutesModule,
    TypeOrmModule.forFeature([User, Travels]),
  ],
  providers: [PdfService],
  controllers: [PdfController],
  exports: [PdfService],
})
export class PdfModule {}
