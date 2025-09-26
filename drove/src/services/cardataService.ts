import ApiService from './api';

export interface CarMakeDto { id?: number; name: string }
export interface CarModelDto { id?: number; name: string; make?: CarMakeDto }
export interface CarTrimDto { id?: number; name: string; year: number; specs?: any }

export class CarDataService {
  static async getMakes(year?: string | number): Promise<CarMakeDto[]> {
    const params = year ? `?year=${encodeURIComponent(String(year))}` : '';
    const res = await ApiService.get<{ source: string; data: CarMakeDto[] }>(`/car-data/makes${params}`);
    return res?.data ?? [];
  }

  static async getModels(make: string, year?: string | number): Promise<CarModelDto[]> {
    const q = new URLSearchParams({ make });
    if (year) q.set('year', String(year));
    const res = await ApiService.get<{ source: string; data: CarModelDto[] }>(`/car-data/models?${q.toString()}`);
    return res?.data ?? [];
  }

  static async getTrims(make: string, model: string, year?: string | number, all?: boolean): Promise<CarTrimDto[]> {
    const q = new URLSearchParams({ make, model });
    if (year) q.set('year', String(year));
    if (all) q.set('all', 'yes');
    const res = await ApiService.get<{ source: string; data: CarTrimDto[] }>(`/car-data/trims?${q.toString()}`);
    return res?.data ?? [];
  }

  static async decodeVin(vin: string, opts?: { verbose?: boolean; allTrims?: boolean }): Promise<any> {
    const q = new URLSearchParams();
    if (opts?.verbose) q.set('verbose', 'yes');
    if (opts?.allTrims) q.set('all_trims', 'yes');
    const suffix = q.toString() ? `?${q.toString()}` : '';
    return ApiService.get<{ source: string; data: any }>(`/car-data/vin/${encodeURIComponent(vin)}${suffix}`);
  }
}

export default CarDataService;


