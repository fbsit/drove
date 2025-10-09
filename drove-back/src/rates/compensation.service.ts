import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Travels, TransferStatus } from '../travels/entities/travel.entity';
import { User, DroverEmploymentType } from '../user/entities/user.entity';

const FREELANCE_TABLE: Array<{ min: number; max: number; driverFee: number }> = [
  { min: 0,    max: 99,   driverFee: 50.0 },
  { min: 100,  max: 199,  driverFee: 70.0 },
  { min: 200,  max: 299,  driverFee: 95.0 },
  { min: 300,  max: 399,  driverFee: 110.0 },
  { min: 400,  max: 499,  driverFee: 119.0 },
  { min: 500,  max: 599,  driverFee: 127.0 },
  { min: 600,  max: 699,  driverFee: 145.0 },
  { min: 700,  max: 799,  driverFee: 160.0 },
  { min: 800,  max: 899,  driverFee: 175.0 },
  { min: 900,  max: 999,  driverFee: 195.0 },
  { min: 1000, max: 1099, driverFee: 210.0 },
  { min: 1100, max: 1199, driverFee: 230.0 },
  { min: 1200, max: 1299, driverFee: 236.0 },
  { min: 1300, max: 1399, driverFee: 245.0 },
  { min: 1400, max: 1499, driverFee: 270.0 },
  { min: 1500, max: 1599, driverFee: 280.0 },
  { min: 1600, max: 1699, driverFee: 290.0 },
  { min: 1700, max: 1799, driverFee: 300.0 },
  { min: 1800, max: 1899, driverFee: 310.0 },
  { min: 1900, max: 1999, driverFee: 320.0 },
];

function parseKmFromDistance(distanceStr?: string | null): number {
  if (!distanceStr) return 0;
  // Accepts formats like "123", "123 km", "1.234,56 km", "123.45 Kilómetros"
  const cleaned = String(distanceStr).replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
  const withDot = cleaned.includes(',') && !cleaned.includes('.')
    ? cleaned.replace(',', '.')
    : cleaned.replace(/,/g, '');
  const n = parseFloat(withDot);
  return isNaN(n) ? 0 : n;
}

@Injectable()
export class CompensationService {
  private readonly CONTRACTED_BASE = 690.67;
  private readonly CONTRACTED_THRESHOLD_KM = 2880;
  private readonly CONTRACTED_EXTRA_RATE = 0.12;

  constructor(
    @InjectRepository(Travels) private readonly travelsRepo: Repository<Travels>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  calcFreelancePerTrip(km: number) {
    const rounded = Math.round(km);
    const row = FREELANCE_TABLE.find(r => rounded >= r.min && rounded <= r.max) || FREELANCE_TABLE[FREELANCE_TABLE.length - 1];
    return {
      type: 'FREELANCE' as const,
      kilometers: rounded,
      range: { min: row.min, max: row.max },
      driverFee: Number(row.driverFee.toFixed(2)),
    };
  }

  // Estimación por viaje para contratados: prorratea el salario base sobre el umbral mensual
  // y agrega extra proporcional por km por encima del umbral si aplica.
  calcContractedPerTrip(km: number) {
    const kilometers = Math.max(0, Math.round(km));
    const basePerKm = this.CONTRACTED_BASE / this.CONTRACTED_THRESHOLD_KM;
    const basePortion = Math.min(kilometers, this.CONTRACTED_THRESHOLD_KM) * basePerKm;
    const extraKm = Math.max(0, kilometers - this.CONTRACTED_THRESHOLD_KM);
    const extraCompensation = extraKm * this.CONTRACTED_EXTRA_RATE;
    const driverFee = Number((basePortion + extraCompensation).toFixed(2));
    return {
      type: 'CONTRACTED' as const,
      kilometers,
      basePerKm: Number(basePerKm.toFixed(4)),
      thresholdKm: this.CONTRACTED_THRESHOLD_KM,
      extraRate: this.CONTRACTED_EXTRA_RATE,
      extraKm,
      driverFee,
    };
  }

  async calcContractedMonthlyByDrover(droverId: string, monthISO: string) {
    const drover = await this.userRepo.findOne({ where: { id: droverId } });
    if (!drover) throw new Error('Drover not found');

    const start = new Date(`${monthISO}-01T00:00:00Z`);
    const end = new Date(new Date(start).setUTCMonth(start.getUTCMonth() + 1));

    const delivered = await this.travelsRepo.find({
      where: {
        droverId,
        status: TransferStatus.DELIVERED,
        updatedAt: Between(start, end),
      },
    });

    const totalKm = delivered.reduce((sum, t) => sum + parseKmFromDistance(t.distanceTravel), 0);
    const extraKm = Math.max(0, Math.round(totalKm) - this.CONTRACTED_THRESHOLD_KM);
    const extraComp = extraKm * this.CONTRACTED_EXTRA_RATE;

    return {
      type: 'CONTRACTED' as const,
      month: monthISO,
      kilometers: Math.round(totalKm),
      baseSalary: Number(this.CONTRACTED_BASE.toFixed(2)),
      thresholdKm: this.CONTRACTED_THRESHOLD_KM,
      extraKm,
      extraRate: this.CONTRACTED_EXTRA_RATE,
      extraCompensation: Number(extraComp.toFixed(2)),
      total: Number((this.CONTRACTED_BASE + extraComp).toFixed(2)),
    };
  }

  async previewForTravelOrMonth(opts: { droverId: string; km?: number; month?: string }) {
    const drover = await this.userRepo.findOne({ where: { id: opts.droverId } });
    if (!drover) throw new Error('Drover not found');
    const type = drover.employmentType || DroverEmploymentType.FREELANCE;
    if (type === DroverEmploymentType.CONTRACTED) {
      if (!opts.month) throw new Error('month is required for CONTRACTED preview (YYYY-MM)');
      return this.calcContractedMonthlyByDrover(opts.droverId, opts.month);
    }
    if (typeof opts.km !== 'number') throw new Error('km is required for FREELANCE preview');
    return this.calcFreelancePerTrip(opts.km);
  }
}

export { parseKmFromDistance };


