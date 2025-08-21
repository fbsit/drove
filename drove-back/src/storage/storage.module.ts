// src/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Travels } from '../travels/entities/travel.entity';
import { User } from '../user/entities/user.entity';
import { ResendService } from '../resend/resend.service';

@Module({
  imports: [
    ConfigModule,
    // Registras aquí los repositorios para inyección
    TypeOrmModule.forFeature([Invoice, Travels, User]),
  ],
  controllers: [StorageController],
  providers: [StorageService, ResendService],
  exports: [StorageService],
})
export class StorageModule {}
