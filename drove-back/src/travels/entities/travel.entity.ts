// src/travels/entities/travel.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import {
  PersonDto,
  PendingViewsDto,
  PickupVerificationDto,
  DeliveryVerificationDto,
  AddressDto,
} from '../dto/create-travel.dto';
import { Payment } from '../../payment/entities/payment.entity';
import { User } from '../../user/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
/** Re-exportamos el enum para que se importe desde aquí */
export enum TransferStatus {
  PENDINGPAID = 'PENDINGPAID',
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_PROGRESS = 'IN_PROGRESS',
  REQUEST_FINISH = 'REQUEST_FINISH',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

interface RescheduleRecord {
  previousDate: string | null;
  previousTime: string | null;
  newDate: string;
  newTime: string;
  changedAt: Date;
  changedBy: string | null;
}

export class RescheduleTravelDto {
  travelDate: string; // “YYYY-MM-DD”
  travelTime: string; // “HH:mm”
}

@Entity('travels') // <— nombre de la tabla
export class Travels {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // — Metadata —
  @Column({ type: 'uuid', nullable: false }) // <— columna cruda
  idClient: string;

  @ManyToOne(() => User, (u) => u.travelsAsClient, { nullable: false, eager: true })
  @JoinColumn({ name: 'idClient' }) // <— FK a la misma columna
  client: User;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.CREATED,
  })
  status: TransferStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  droverId: string | null; // <— columna cruda (puede ser null)

  @ManyToOne(() => User, (u) => u.travelsAsDrover, { nullable: true, eager: true })
  @JoinColumn({ name: 'droverId' })
  drover?: User;

  @Column({ nullable: true })
  assignedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt?: Date;

  @Column({ nullable: true })
  orderId?: string;

  @OneToOne(() => Invoice, (inv) => inv.travel, { nullable: true })
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
  invoice?: Invoice;

  // — Campos enviados por el frontend —
  @Column({ nullable: true })
  bastidor?: string;

  @Column({ nullable: true })
  typeVehicle?: string;

  @Column({ nullable: true })
  brandVehicle?: string;

  @Column({ nullable: true })
  modelVehicle?: string;

  @Column({ nullable: true })
  yearVehicle?: string;

  @Column({ nullable: true })
  patentVehicle?: string; // matrícula

  @Column({ type: 'jsonb', nullable: true })
  startAddress: AddressDto;

  @Column({ type: 'jsonb', nullable: true })
  endAddress: AddressDto;

  @Column({ type: 'date', nullable: true })
  travelDate?: string;

  @Column({ nullable: true })
  travelTime?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  timeTravel?: string; // duración de viaje como string finalmente

  @Column({ nullable: true, type: 'text' })
  routePolyline?: string;

  @Column({ nullable: true })
  distanceTravel?: string; // coincide con DTO

  @Column({ nullable: true })
  priceRoute?: string; // coincide con DTO

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ type: 'text', nullable: true })
  signatureStartClient?: string;

  @Column({ type: 'float', nullable: true })
  totalPrice?: number;

  // — Columnas JSON para objetos anidados —
  @Column({ type: 'simple-json', nullable: true })
  personDelivery?: PersonDto;

  @Column({ type: 'simple-json', nullable: true })
  personReceive?: PersonDto;

  @Column({ type: 'simple-json', nullable: true })
  pendingViews?: PendingViewsDto;

  @Column({ type: 'simple-json', nullable: true })
  pickupVerification?: PickupVerificationDto;

  @Column({ type: 'simple-json', nullable: true })
  deliveryVerification?: DeliveryVerificationDto;

  @OneToMany(() => Payment, (p) => p.travel)
  payments: Payment[];

  @Column({ type: 'jsonb', nullable: true })
  rescheduleHistory?: RescheduleRecord[];

  @Column({ type: 'text', nullable: true })
  reasonCancellation?: string | null;
}
