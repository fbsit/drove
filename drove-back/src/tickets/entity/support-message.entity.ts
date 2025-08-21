// src/support/entities/support-message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupportTicket } from './support-ticket.entity';

export enum MessageSender {
  ADMIN = 'admin',
  CLIENT = 'client',
  DROVER = 'drover',
}

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ type: 'enum', enum: MessageSender })
  sender: MessageSender;

  @Column()
  senderName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column('uuid')
  ticketId: string;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticketId' })
  ticket: SupportTicket;
}
