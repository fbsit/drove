import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Travels } from '../../travels/entities/travel.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  clientId: string;
  @ManyToOne(() => User, (u) => u.travelsAsClient, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column('uuid')
  droverId: string;
  @ManyToOne(() => User, (u) => u.travelsAsDrover, { nullable: false })
  @JoinColumn({ name: 'droverId' })
  drover: User;

  @Column('uuid')
  travelId: string;
  @ManyToOne(() => Travels, (t) => t.payments, { nullable: false })
  @JoinColumn({ name: 'travelId' })
  travel: Travels;
}
