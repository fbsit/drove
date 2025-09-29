// src/support/entities/support-ticket.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SupportMessage } from './support-message.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ClientType {
  CLIENT = 'client',
  DROVER = 'drover',
}

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column('text')
  message: string;

  // Dueño del ticket (usuario autenticado que lo creó)
  @Column({ type: 'uuid', nullable: true })
  ownerUserId?: string | null;
  // Rol del dueño (CLIENT/DROVER)
  @Column({ type: 'enum', enum: ClientType, nullable: true })
  ownerRole?: ClientType | null;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  // Admin asignado (si aplica)
  @Column({ type: 'uuid', nullable: true })
  assignedAdminId?: string | null;

  @Column()
  clientName: string;

  @Column()
  clientEmail: string;

  @Column({ type: 'enum', enum: ClientType })
  clientType: ClientType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt?: Date | null;

  @OneToMany(() => SupportMessage, (msg) => msg.ticket, { cascade: true })
  messages: SupportMessage[];
}
