// src/user/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ContactInfoDto } from './../dtos/contact-info.dto';
import { Travels } from './../../travels/entities/travel.entity';

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum UserRole {
  CLIENT = 'CLIENT',
  DROVER = 'DROVER',
  ADMIN = 'ADMIN',
  TRAFFICBOSS = 'TRAFFICBOSS',
}

export enum UserAccountType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

// Tipo de relación laboral del drover (aplica sólo cuando role === DROVER)
export enum DroverEmploymentType {
  FREELANCE = 'FREELANCE',
  CONTRACTED = 'CONTRACTED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 6, nullable: true })
  verificationCode?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  codeExpiresAt?: Date | null;

  @Column({ type: 'simple-json' })
  contactInfo: ContactInfoDto;

  /* ─────── nuevas columnas ─────── */
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  // Subtipo de cuenta para distinguir persona vs empresa (no afecta permisos)
  @Column({ type: 'enum', enum: UserAccountType, default: UserAccountType.PERSON })
  accountType: UserAccountType;

  // Relación laboral del drover (freelance/contratado). Null para roles que no son DROVER.
  @Column({ type: 'enum', enum: DroverEmploymentType, nullable: true, default: DroverEmploymentType.FREELANCE })
  employmentType?: DroverEmploymentType | null;

  // Posición actual del drover cuando el tracking está activo
  @Column({ type: 'float', nullable: true })
  currentLat?: number | null;

  @Column({ type: 'float', nullable: true })
  currentLng?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  currentPositionUpdatedAt?: Date | null;

  // Disponibilidad del drover en el sistema (visible para asignación)
  @Column({ type: 'boolean', nullable: true, default: false })
  isAvailable?: boolean | null;
  /* ─────────────────────────────── */

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => Travels, (t) => t.client)
  travelsAsClient: Travels[];

  @OneToMany(() => Travels, (t) => t.drover)
  travelsAsDrover: Travels[];
}
