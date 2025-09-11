// src/routes/routes.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

@Injectable()
export class RoutesService {
  constructor(private readonly configService: ConfigService) {}
  async getRoutes(obj: any): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': '*',
            'X-Goog-Api-Key': apiKey!,
          },
          body: JSON.stringify(obj),
        },
      );
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching route data:', error);
      throw new InternalServerErrorException('Unable to fetch route data');
    }
  }

  async getDistance(params: any): Promise<any> {
    // Fallback Haversine en caso de error con Google
    const haversineKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ): number => {
      const R = 6371; // km
      const toRad = (v: number) => (v * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const safeFallback = (
      oLat: number,
      oLng: number,
      dLat: number,
      dLng: number,
    ) => {
      const km = Math.max(0, Math.round(haversineKm(oLat, oLng, dLat, dLng)));
      const minutes = Math.max(0, Math.round(km * 1.2)); // ~50 km/h promedio
      const duration = `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
      return { distance: `${km} km`, duration, source: 'fallback' };
    };

    try {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

      // Extraer y validar coordenadas
      const originLat = Number(params?.originLat);
      const originLng = Number(params?.originLng);
      const destinationLat = Number(params?.destinationLat);
      const destinationLng = Number(params?.destinationLng);

      if (!isFinite(originLat) || !isFinite(originLng) || !isFinite(destinationLat) || !isFinite(destinationLng)) {
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      const origins = `${originLat},${originLng}`;
      const destinations = `${destinationLat},${destinationLng}`;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=metric&language=es&region=cl&key=${apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      const json = await response.json();

      const element = json?.rows?.[0]?.elements?.[0];

      if (!element || element?.status === 'ZERO_RESULTS' || json?.status !== 'OK') {
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      const distance = element?.distance?.text ?? '';
      const duration = element?.duration?.text ?? '';

      if (!distance || !duration) {
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      return { distance, duration };
    } catch (error) {
      console.error('Error al obtener los datos de distancia:', error);
      const originLat = Number(params?.originLat);
      const originLng = Number(params?.originLng);
      const destinationLat = Number(params?.destinationLat);
      const destinationLng = Number(params?.destinationLng);
      return safeFallback(originLat, originLng, destinationLat, destinationLng);
    }
  }
}
