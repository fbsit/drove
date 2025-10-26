import ApiService from './api';

export interface CarMakeDto { id?: number; name: string }
export interface CarModelDto { id?: number; name: string; make?: CarMakeDto }
export interface CarTrimDto { id?: number; name: string; year: number; specs?: any }

export class CarDataService {
  // Datos locales de marcas comunes para evitar llamadas a la API
  private static readonly LOCAL_MAKES = [
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Volvo', 'Saab',
    'Ford', 'Chevrolet', 'GMC', 'Cadillac', 'Buick', 'Chrysler',
    'Dodge', 'Jeep', 'Ram', 'Tesla', 'Hyundai', 'Kia', 'Genesis',
    'Fiat', 'Alfa Romeo', 'Maserati', 'Ferrari', 'Lamborghini',
    'Porsche', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
    'Iveco', 'MAN', 'Scania', 'Volvo Trucks', 'Mercedes-Benz Trucks'
  ];

  // Datos locales de modelos comunes por marca
  private static readonly LOCAL_MODELS: Record<string, string[]> = {
    'Toyota': ['Corolla', 'Camry', 'RAV4', 'Prius', 'Highlander', 'Tacoma', 'Tundra', 'Sienna'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Passport', 'Ridgeline'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'Z4', 'i3', 'i8'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'GLA'],
    'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
    'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'Beetle', 'CC', 'Arteon'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Focus', 'Fusion'],
    'Chevrolet': ['Silverado', 'Camaro', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Malibu', 'Cruze'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Armada', '370Z', 'GT-R'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30'],
    'Fiat': ['500', '500L', '500X', 'Panda', 'Tipo', 'Doblo', 'Ducato'],
    'Iveco': ['Daily', 'Eurocargo', 'Stralis', 'Hi-Way', 'Trakker', 'S-Way']
  };

  static async getMakes(year?: string | number): Promise<CarMakeDto[]> {
    // Devolver datos locales sin hacer llamadas a la API
    return this.LOCAL_MAKES.map((name, index) => ({ id: index + 1, name }));
  }

  static async getModels(make: string, year?: string | number): Promise<CarModelDto[]> {
    // Devolver modelos locales para la marca especificada
    const models = this.LOCAL_MODELS[make] || [];
    return models.map((name, index) => ({ 
      id: index + 1, 
      name, 
      make: { id: 1, name: make } 
    }));
  }

  static async getTrims(make: string, model: string, year?: string | number, all?: boolean): Promise<CarTrimDto[]> {
    // Devolver array vacío para versiones (trims) ya que no tenemos datos locales
    return [];
  }

  // Deshabilitado: mantener firma para compatibilidad sin llamar al backend
  static async decodeVin(_vin: string, _opts?: { verbose?: boolean; allTrims?: boolean }): Promise<any> {
    return { disabled: true } as any;
  }
}

export default CarDataService;


