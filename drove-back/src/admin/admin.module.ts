// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { Travels } from '../travels/entities/travel.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    // ← aquí registras los repositorios que necesitas
    TypeOrmModule.forFeature([User, Travels, Payment, Invoice]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // opcional, por si otro módulo necesita el servicio
})
export class AdminModule {}
