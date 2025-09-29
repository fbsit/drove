import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class CarApiClient {
  private readonly logger = new Logger(CarApiClient.name);
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;
  private readonly bearerJwt: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('CARAPI_BASE_URL') || 'https://carapi.app';
    // Always use provided JWT unless overridden via env CARAPI_JWT
    this.bearerJwt =
      this.config.get<string>('CARAPI_JWT') ||
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjYXJhcGkuYXBwIiwic3ViIjoiN2ExZjJjOGItNmM1NC00ZWViLWIzYWYtNzcwZGJmMjQzNGZjIiwiYXVkIjoiN2ExZjJjOGItNmM1NC00ZWViLWIzYWYtNzcwZGJmMjQzNGZjIiwiZXhwIjoxNzU5Njc5NTAxLCJpYXQiOjE3NTkwNzQ3MDEsImp0aSI6IjQ3M2VkMGZlLTljNGMtNDc4ZC04YzgzLTYxMTVlMTlhODg4OCIsInVzZXIiOnsic3Vic2NyaXB0aW9ucyI6WyJwcmVtaXVtIl0sInJhdGVfbGltaXRfdHlwZSI6ImhhcmQiLCJhZGRvbnMiOnsiYW50aXF1ZV92ZWhpY2xlcyI6ZmFsc2UsImRhdGFfZmVlZCI6ZmFsc2V9fX0.BGRDXmsAg0wIP-hYjAz-k50IU1eZlGx4udlK5k4dNio';

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.bearerJwt}`,
      };
      const res = await this.http.get(url, { params, headers });
      return res.data as T;
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message;
      this.logger.warn(`CarAPI GET ${url} failed (${status}): ${msg}`);
      throw err;
    }
  }

  async getMakes(year?: number): Promise<any> {
    try {
      return await this.get('/api/makes/v2', year ? { year } : undefined);
    } catch (err: any) {
      throw err;
    }
  }

  async getModels(make: string, year?: number): Promise<any> {
    try {
      // Prefer v2 endpoint as per deprecation notice
      return await this.get('/api/models/v2', { make, year });
    } catch (err: any) {
      throw err;
    }
  }

  async getTrims(make: string, model: string, year?: number, all = false): Promise<any> {
    try {
      return await this.get('/api/trims/v2', { make, model, year, all });
    } catch (err: any) {
      throw err;
    }
  }

  async decodeVin(vin: string, verbose = false, allTrims = false): Promise<any> {
    return this.get(`/api/vin/${encodeURIComponent(vin)}`, { verbose, allTrims });
  }
}


