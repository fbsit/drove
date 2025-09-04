// src/invoices/entities/invoice.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Travels } from './../../travels/entities/travel.entity';
// Estado de la factura
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  VOID = 'VOID',
}

// Métodos de pago disponibles
export enum PaymentMethod {
  STRIPE = 'stripe',
  TRANSFER = 'transfer',
}

// Detalle de línea de factura
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

// Referencia al pago
export interface PaymentReference {
  stripePaymentId?: string; // presente si fue por Stripe
  transferReference?: string; // presente si fue transferencia manual
  amount: number;
  paidAt: string; // ISO date string
  method: PaymentMethod;
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ nullable: true })
  invoiceNumber?: string;

  @Column({ nullable: true })
  issuedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  issuedAt?: Date;

  // --- Nuevos campos ---
  @Column({ nullable: true })
  urlPDF?: string; // URL del PDF de la factura

  @Column()
  customerId: string;

  @Column({ type: 'date' })
  invoiceDate: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: string;

  @Column()
  currency: string;

  @Column('float')
  totalAmount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.STRIPE })
  paymentMethod: PaymentMethod; // método de pago principal

  @Column({ type: 'simple-json' })
  lineItems: LineItem[];

  @Column({ type: 'simple-json', nullable: true })
  payments?: PaymentReference[];

  @OneToOne(() => Travels, (t) => t.invoice, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'travelId', referencedColumnName: 'id' })
  travel?: Travels;

  @Column({ nullable: true })
  travelId?: string;
}
