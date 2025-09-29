import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('vin_decodes')
export class VinDecode {
  @PrimaryColumn()
  @Index({ unique: true })
  vin: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @CreateDateColumn()
  createdAt: Date;
}


