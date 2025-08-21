// src/travels/entities/travel-offer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Travels } from './travel.entity';
import { User } from '../../user/entities/user.entity';

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

@Entity('travel_offers')
@Unique(['travel', 'drover']) // 1 viaje ↔ 1 drover ↔ 1 fila
export class TravelOffer {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Travels, (t) => t.id, { onDelete: 'CASCADE' })
  travel: Travels;

  @ManyToOne(() => User, (u) => u.id, { onDelete: 'CASCADE' })
  drover: User;

  @Column({ type: 'enum', enum: OfferStatus, default: OfferStatus.PENDING })
  status: OfferStatus;

  @Column({ type: 'timestamp', nullable: true }) respondedAt?: Date;
}
