import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';
import { VinDecodeVincario } from './entities/vin-decode-vincario.entity';

export interface VincarioResponse {
  success: boolean;
  data?: {
    make: string;
    model: string;
    year: string;
    vin: string;
  };
  error?: string;
}

@Injectable()
export class VincarioService {
  private readonly logger = new Logger(VincarioService.name);
  private readonly apiKey = 'ccbebcaeaadb';
  private readonly secretKey = '9f2607c5ba';
  private readonly baseUrl = 'https://api.vincario.com/3.2';
  private readonly vinTtlMs = 90 * 24 * 60 * 60 * 1000; // 90 días

  constructor(
    @InjectRepository(VinDecodeVincario)
    private readonly vinRepo: Repository<VinDecodeVincario>,
    private readonly httpService: HttpService,
  ) {}

  private generateControlSum(vin: string): string {
    const data = `${vin}|decode|${this.apiKey}|${this.secretKey}`;
    return createHash('sha1').update(data).digest('hex').substring(0, 10);
  }

  private validateVinFormat(vin: string): boolean {
    if (!vin || vin.length !== 17) return false;
    
    // VIN no debe contener I, O, Q
    const invalidChars = /[IOQ]/;
    return !invalidChars.test(vin);
  }

  async decodeVin(vin: string): Promise<VincarioResponse> {
    // Validar formato VIN
    if (!this.validateVinFormat(vin)) {
      this.logger.warn(`VIN inválido: ${vin}`);
      return {
        success: false,
        error: 'VIN inválido. Debe tener 17 caracteres alfanuméricos sin I, O, Q'
      };
    }

    const normalizedVin = vin.toUpperCase();

    try {
      // Verificar cache en base de datos
      const cached = await this.vinRepo.findOne({ 
        where: { vin: normalizedVin } 
      });

      if (cached) {
        const isFresh = Date.now() - new Date(cached.createdAt).getTime() < this.vinTtlMs;
        if (isFresh) {
          // Verificar que los datos cacheados tengan información útil
          const cachedData = cached.payload;
          const cachedDecodeArray = cachedData.decode || [];
          
          // Función helper para extraer valor por label del cache
          const getCachedValueByLabel = (label: string): string => {
            const item = cachedDecodeArray.find((item: any) => item.label === label);
            return item ? String(item.value) : '';
          };
          
          const cachedMake = getCachedValueByLabel('Make');
          const cachedModel = getCachedValueByLabel('Model');
          const cachedYear = getCachedValueByLabel('Model Year');
          
          const hasUsefulCachedData = cachedMake && cachedModel && cachedYear;
          
          if (hasUsefulCachedData) {
            this.logger.log(`VIN ${normalizedVin} encontrado en cache con datos útiles`);
            return {
              success: true,
              data: {
                make: cachedMake,
                model: cachedModel,
                year: cachedYear,
                vin: normalizedVin
              }
            };
          } else {
            this.logger.warn(`VIN ${normalizedVin} en cache no tiene información útil - ignorando cache`);
          }
        }
      }

      // Llamar a Vincario API
      const controlSum = this.generateControlSum(normalizedVin);
      const url = `${this.baseUrl}/${this.apiKey}/${controlSum}/decode/${normalizedVin}.json`;
      
      this.logger.log(`Validando VIN ${normalizedVin} con Vincario API`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 10000, // 10 segundos timeout
        })
      );

      console.log(response);

      const data = response.data;

      // Loggear la respuesta completa de Vincario
      this.logger.log(`Vincario API response para VIN ${normalizedVin}:`, JSON.stringify(data, null, 2));

      // Verificar si la respuesta es exitosa
      if (!data || data.error) {
        this.logger.warn(`Vincario API error para VIN ${normalizedVin}:`, data?.error);
        return {
          success: false,
          error: data?.error || 'No se encontró información para este VIN'
        };
      }

      // Vincario devuelve los datos en un array 'decode' con objetos {label, value}
      const decodeArray = data.decode || [];
      this.logger.log(`Array decode tiene ${decodeArray.length} elementos`);
      
      // Función helper para extraer valor por label
      const getValueByLabel = (label: string): string => {
        const item = decodeArray.find((item: any) => item.label === label);
        return item ? String(item.value) : '';
      };
      
      // Extraer datos relevantes del array decode
      const vinData = {
        make: getValueByLabel('Make'),
        model: getValueByLabel('Model'),
        year: getValueByLabel('Model Year'),
        vin: normalizedVin
      };
      
      this.logger.log(`Datos extraídos: make=${vinData.make}, model=${vinData.model}, year=${vinData.year}`);

      // Verificar si tenemos información útil antes de cachear
      const hasUsefulData = vinData.make && vinData.model && vinData.year;
      
      if (hasUsefulData) {
        // Solo guardar en cache si tenemos información útil
        try {
          await this.vinRepo.save({
            vin: normalizedVin,
            payload: data
          });
          this.logger.log(`VIN ${normalizedVin} guardado en cache con datos útiles`);
        } catch (cacheError) {
          this.logger.warn(`Error guardando VIN en cache:`, cacheError);
          // No fallar por error de cache
        }
      } else {
        this.logger.warn(`VIN ${normalizedVin} no tiene información útil - no se cachea`);
        return {
          success: false,
          error: 'No se encontró información completa para este VIN (marca, modelo o año faltante)'
        };
      }

      this.logger.log(`VIN ${normalizedVin} validado exitosamente: ${vinData.make} ${vinData.model} ${vinData.year}`);
      
      return {
        success: true,
        data: vinData
      };

    } catch (error) {
      this.logger.error(`Error validando VIN ${normalizedVin}:`, error);
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Timeout al validar VIN. Intenta nuevamente'
        };
      }
      
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Demasiadas solicitudes. Espera 30 segundos'
        };
      }

      return {
        success: false,
        error: 'Error al validar VIN. Intenta nuevamente'
      };
    }
  }
}
