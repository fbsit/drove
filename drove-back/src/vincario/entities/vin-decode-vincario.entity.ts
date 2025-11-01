import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('vin_decode_vincario')
@Index(['vin'], { unique: true })
export class VinDecodeVincario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 17, unique: true })
  vin: string;

  @Column('jsonb')
  payload: any;

  @CreateDateColumn()
  createdAt: Date;
}
