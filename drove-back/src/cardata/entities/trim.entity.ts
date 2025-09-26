import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { CarModel } from './model.entity';

@Entity('car_trims')
@Index(['model', 'year', 'name'], { unique: true })
export class CarTrim {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CarModel, (m) => m.trims, { eager: true })
  model: CarModel;

  @Column()
  year: number;

  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  specs?: any;
}


