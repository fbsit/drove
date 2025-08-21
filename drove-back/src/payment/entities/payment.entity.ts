// src/payment/entities/payment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Travels } from '../../travels/entities/travel.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
  /* ────────────────────────────────────────────────
   * Identificación y estado
   * ──────────────────────────────────────────────── */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ nullable: true })
  method?: string;

  /* ────────────────────────────────────────────────
   * Monto y divisa
   * ──────────────────────────────────────────────── */
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // ej. 199.99

  @Column({ length: 3, default: 'USD' })
  currency: string; // ej. USD, EUR, CLP

  /* ────────────────────────────────────────────────
   * Referencias Stripe
   * ──────────────────────────────────────────────── */
  @Index()
  @Column('text')
  paymentIntentId: string; // pi_XXXXXXXX

  @Index()
  @Column({ length: 255, nullable: true })
  chargeId?: string; // ch_XXXXXXXX

  @Column({ nullable: true })
  receiptUrl?: string;

  /* ────────────────────────────────────────────────
   * Relación con Travels  (adminService usa 'transfer')
   * ──────────────────────────────────────────────── */
  @ManyToOne(() => Travels, (t) => t.payments, { onDelete: 'CASCADE' })
  travel: Travels;

  /* ────────────────────────────────────────────────
   * Auditoría interna
   * ──────────────────────────────────────────────── */
  @Column({ nullable: true })
  confirmedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;
}
