import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { UserRole } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  // Destinatario específico (si aplica). Si se define, tiene prioridad sobre roleTarget
  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  // Destinatario por rol (ADMIN, CLIENT, DROVER, TRAFFICBOSS) o 'ALL'
  @Index()
  @Column({ type: 'varchar', length: 32, default: 'ALL' })
  roleTarget: UserRole | 'ALL';

  // Clasificación básica para UI (p.ej. NEW_USER, TRAVEL_UPDATED, PAYMENT, SYSTEM)
  @Index()
  @Column({ type: 'varchar', length: 64 })
  category: string;

  // Enlace a entidad de negocio (opcional)
  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  entityType: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  entityId: string | null;

  // Payload adicional para la UI
  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
