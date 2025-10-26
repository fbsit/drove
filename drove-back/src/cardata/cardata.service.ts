import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarApiClient } from './carapi.client';
import { CarMake } from './entities/make.entity';
import { CarModel } from './entities/model.entity';
import { CarTrim } from './entities/trim.entity';
import { VinDecode } from './entities/vin-decode.entity';

interface CacheEntry<T> { value: T; expiresAt: number; }

@Injectable()
export class CarDataService {
  private readonly logger = new Logger(CarDataService.name);
  private readonly memoryCache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtlMs = 10 * 60 * 1000; // 10 min
  private readonly vinTtlMs = 90 * 24 * 60 * 60 * 1000; // 90 días

  constructor(
    private readonly carapi: CarApiClient,
    @InjectRepository(CarMake) private readonly makeRepo: Repository<CarMake>,
    @InjectRepository(CarModel) private readonly modelRepo: Repository<CarModel>,
    @InjectRepository(CarTrim) private readonly trimRepo: Repository<CarTrim>,
    @InjectRepository(VinDecode) private readonly vinRepo: Repository<VinDecode>,
  ) {}

  private getCache<T>(key: string): T | null {
    const hit = this.memoryCache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return hit.value as T;
  }

  private setCache<T>(key: string, value: T, ttlMs = this.defaultTtlMs) {
    this.memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async getMakes(year?: number) {
    const cacheKey = `makes:${year ?? 'any'}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return { source: 'cache', data: cached };

    // Solo usar datos locales de la base de datos
    const makes = await this.makeRepo.find();
    if (makes.length > 0) {
      this.setCache(cacheKey, makes);
      return { source: 'db', data: makes };
    }

    // Si no hay datos en la base de datos, devolver array vacío
    this.logger.warn(`No se encontraron marcas en la base de datos para el año ${year ?? 'cualquiera'}`);
    return { source: 'db', data: [] };
  }

  async getModels(makeName: string, year?: number) {
    const cacheKey = `models:${makeName}:${year ?? 'any'}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return { source: 'cache', data: cached };

    const make = await this.makeRepo.findOne({ where: { name: makeName } });
    if (make) {
      const models = await this.modelRepo.find({ where: { make: { id: make.id } } });
      if (models.length) {
        this.setCache(cacheKey, models);
        return { source: 'db', data: models };
      }
    }

    // Si no hay datos en la base de datos, devolver array vacío
    this.logger.warn(`No se encontraron modelos para la marca ${makeName} en la base de datos para el año ${year ?? 'cualquiera'}`);
    return { source: 'db', data: [] };
  }

  async getTrims(makeName: string, modelName: string, year?: number, all = false) {
    const cacheKey = `trims:${makeName}:${modelName}:${year ?? 'any'}:${all}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return { source: 'cache', data: cached };

    const make = await this.makeRepo.findOne({ where: { name: makeName } });
    const model = make
      ? await this.modelRepo.findOne({ where: { make: { id: make.id }, name: modelName } })
      : null;
    if (model) {
      const trims = await this.trimRepo.find({ where: { model: { id: model.id } } });
      if (trims.length) {
        this.setCache(cacheKey, trims);
        return { source: 'db', data: trims };
      }
    }

    // Si no hay datos en la base de datos, devolver array vacío
    this.logger.warn(`No se encontraron versiones para ${makeName} ${modelName} en la base de datos para el año ${year ?? 'cualquiera'}`);
    return { source: 'db', data: [] };
  }

  async decodeVin(vin: string, verbose = false, allTrims = false) {
    const key = `vin:${vin}:${verbose}:${allTrims}`;
    const cached = this.getCache<any>(key);
    if (cached) return { source: 'cache', data: cached };

    // check db ttl
    const existing = await this.vinRepo.findOne({ where: { vin } });
    if (existing) {
      const fresh = Date.now() - new Date(existing.createdAt).getTime() < this.vinTtlMs;
      if (fresh) {
        this.setCache(key, existing.payload, this.vinTtlMs);
        return { source: 'db', data: existing.payload };
      }
    }

    // Si no hay datos en la base de datos, devolver objeto vacío
    this.logger.warn(`No se encontró información VIN para ${vin} en la base de datos`);
    return { source: 'db', data: {} };
  }

  /**
   * Método para poblar la base de datos con datos básicos de marcas y modelos
   * Esto evita la necesidad de llamadas a la API externa
   */
  async seedBasicCarData() {
    try {
      // Verificar si ya hay datos
      const existingMakes = await this.makeRepo.count();
      if (existingMakes > 0) {
        this.logger.log('Los datos básicos de vehículos ya están poblados');
        return { success: true, message: 'Datos ya existentes' };
      }

      // Datos básicos de marcas comunes
      const basicMakes = [
        'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi',
        'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Volvo', 'Saab',
        'Ford', 'Chevrolet', 'GMC', 'Cadillac', 'Buick', 'Chrysler',
        'Dodge', 'Jeep', 'Ram', 'Tesla', 'Hyundai', 'Kia', 'Genesis',
        'Fiat', 'Alfa Romeo', 'Maserati', 'Ferrari', 'Lamborghini',
        'Porsche', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
        'Iveco', 'MAN', 'Scania', 'Volvo Trucks', 'Mercedes-Benz Trucks'
      ];

      const makeEntities = await this.makeRepo.save(
        basicMakes.map(name => this.makeRepo.create({ name }))
      );

      this.logger.log(`Se poblaron ${makeEntities.length} marcas básicas`);
      return { success: true, message: `Se poblaron ${makeEntities.length} marcas básicas` };
    } catch (error) {
      this.logger.error('Error poblando datos básicos:', error);
      return { success: false, message: 'Error poblando datos básicos' };
    }
  }
}


