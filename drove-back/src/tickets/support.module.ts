// src/support/support.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportTicket } from './entity/support-ticket.entity';
import { SupportMessage } from './entity/support-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket, SupportMessage])],
  providers: [SupportService],
  controllers: [SupportController],
})
export class SupportModule {}
