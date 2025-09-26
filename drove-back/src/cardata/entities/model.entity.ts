import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany } from 'typeorm';
import { CarMake } from './make.entity';
import { CarTrim } from './trim.entity';

@Entity('car_models')
@Index(['make', 'name'], { unique: true })
export class CarModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CarMake, (m) => m.models, { eager: true })
  make: CarMake;

  @Column()
  name: string;

  @Column({ nullable: true })
  yearStart?: number;

  @Column({ nullable: true })
  yearEnd?: number;

  @OneToMany(() => CarTrim, (t) => t.model)
  trims?: CarTrim[];
}


