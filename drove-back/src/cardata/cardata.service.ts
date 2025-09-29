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

    // try db seed first
    const makes = await this.makeRepo.find();
    if (makes.length > 0) {
      this.setCache(cacheKey, makes);
      return { source: 'db', data: makes };
    }

    const api = await this.carapi.getMakes(year);
    const names: string[] = (api?.data ?? api ?? []).map((m: any) => m.name || m.make || m);
    const entities = await this.makeRepo.save(
      names.map((name) => this.makeRepo.create({ name })),
    );
    this.setCache(cacheKey, entities);
    return { source: 'remote', data: entities };
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

    const api = await this.carapi.getModels(makeName, year);
    const names: string[] = (api?.data ?? api ?? []).map((m: any) => m.name || m.model || m);
    const makeEntity = make || (await this.makeRepo.save(this.makeRepo.create({ name: makeName })));
    const entities = await this.modelRepo.save(
      names.map((name) => this.modelRepo.create({ name, make: makeEntity })),
    );
    this.setCache(cacheKey, entities);
    return { source: 'remote', data: entities };
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

    const api = await this.carapi.getTrims(makeName, modelName, year, all);
    const list: Array<{ name: string; year?: number; specs?: any }> = (api?.data ?? api ?? []).map((t: any) => ({
      name: t.name || t.trim || t,
      year: t.year || year || null,
      specs: t.specs || t,
    }));
    const makeEntity = make || (await this.makeRepo.save(this.makeRepo.create({ name: makeName })));
    const modelEntity =
      model || (await this.modelRepo.save(this.modelRepo.create({ name: modelName, make: makeEntity })));
    const entities = await this.trimRepo.save(
      list.map((t) => this.trimRepo.create({ name: t.name, year: t.year ?? new Date().getFullYear(), model: modelEntity, specs: t.specs })),
    );
    this.setCache(cacheKey, entities);
    return { source: 'remote', data: entities };
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

    const api = await this.carapi.decodeVin(vin, verbose, allTrims);
    const payload = api?.data ?? api ?? {};
    await this.vinRepo.save(this.vinRepo.create({ vin, payload }));
    this.setCache(key, payload, this.vinTtlMs);
    return { source: 'remote', data: payload };
  }
}


