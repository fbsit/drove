import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { CarModel } from './model.entity';

@Entity('car_makes')
export class CarMake {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index({ unique: true })
  name: string;

  @OneToMany(() => CarModel, (m: CarModel) => m.make)
  models?: CarModel[];
}


