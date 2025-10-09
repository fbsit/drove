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

  // Deshabilitado: mantener firma para compatibilidad sin llamar al backend
  static async decodeVin(_vin: string, _opts?: { verbose?: boolean; allTrims?: boolean }): Promise<any> {
    return { disabled: true } as any;
  }
}

export default CarDataService;


