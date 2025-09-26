import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class CarApiClient {
  private readonly logger = new Logger(CarApiClient.name);
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiToken: string;
  private readonly apiSecret: string;
  private jwt: string | null = null;
  private jwtExpiresAt: number | null = null;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('CARAPI_BASE_URL') || 'https://carapi.app';
    this.apiKey = this.config.get<string>('CARAPI_API_KEY') || '';
    // Defaults requested by user (keep private)
    this.apiToken = this.config.get<string>('CARAPI_API_TOKEN') || '949e6f1c-b73a-41a9-92e6-9128c86a081c';
    this.apiSecret = this.config.get<string>('CARAPI_API_SECRET') || '06f03d827e6ab48ab7ce3e023d82c439';

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async ensureAuth(): Promise<void> {
    // Prefer API Key if provided
    if (this.apiKey) {
      this.jwt = null; // use apiKey directly
      return;
    }
    // Use cached JWT if valid (5 min skew)
    if (this.jwt && this.jwtExpiresAt && Date.now() + 5 * 60_000 < this.jwtExpiresAt) {
      return;
    }
    // If token/secret available, attempt to fetch a JWT
    if (this.apiToken && this.apiSecret) {
      try {
        const res = await this.http.post('/api/auth', {
          token: this.apiToken,
          secret: this.apiSecret,
        });
        const data = res.data || {};
        const jwt = data.jwt || data.token || data.access_token;
        if (jwt) {
          this.jwt = jwt;
          const expiresInSec = data.expiresIn || data.expires_in || (7 * 24 * 60 * 60); // default 7d
          this.jwtExpiresAt = Date.now() + Number(expiresInSec) * 1000;
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err.message;
        this.logger.warn(`CarAPI auth failed (${status}): ${msg}`);
        // continue without auth if fails
      }
    }
  }

  private async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      await this.ensureAuth();
      const headers: Record<string, string> = {};
      if (this.jwt) headers.Authorization = `Bearer ${this.jwt}`;
      else if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
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
    return this.get('/api/makes', year ? { year } : undefined);
  }

  async getModels(make: string, year?: number): Promise<any> {
    return this.get('/api/models', { make, year });
  }

  async getTrims(make: string, model: string, year?: number, all = false): Promise<any> {
    return this.get('/api/trims', { make, model, year, all });
  }

  async decodeVin(vin: string, verbose = false, allTrims = false): Promise<any> {
    return this.get(`/api/vin/${encodeURIComponent(vin)}`, { verbose, allTrims });
  }
}


