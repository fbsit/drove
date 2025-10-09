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

    const tryOsrm = async (
      oLat: number,
      oLng: number,
      dLat: number,
      dLng: number,
    ) => {
      try {
        // OSRM espera lon,lat
        const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=false&alternatives=false&steps=false`;
        const resp = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (!resp.ok) return null;
        const json = await resp.json();
        const route = json?.routes?.[0];
        if (!route || json?.code !== 'Ok') return null;
        const km = Math.max(0, Math.round(Number(route.distance || 0) / 1000));
        const mins = Math.max(0, Math.round(Number(route.duration || 0) / 60));
        const duration = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
        return { distance: `${km} km`, duration, source: 'osrm' };
      } catch {
        return null;
      }
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
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=metric&language=es&region=cl&mode=driving&key=${apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        // Intentar con Routes API como fallback mejorado antes de distancia geodésica
        const routesAlt = await this.getRoutes({
          origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
          destination: { location: { latLng: { latitude: destinationLat, longitude: destinationLng } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
          computeAlternativeRoutes: false,
          languageCode: 'es-CL',
          units: 'METRIC',
        });
        const r = routesAlt?.routes?.[0];
        if (r?.distanceMeters && r?.duration) {
          const km = Math.max(0, Math.round(Number(r.distanceMeters) / 1000));
          const secs = Number(String(r.duration).replace(/[^0-9]/g, '')) || 0;
          const mins = Math.max(0, Math.round(secs / 60));
          const duration = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
          return { distance: `${km} km`, duration, source: 'routes' };
        }
        // Intentar OSRM
        const osrm = await tryOsrm(originLat, originLng, destinationLat, destinationLng);
        if (osrm) return osrm;
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      const json = await response.json();

      const element = json?.rows?.[0]?.elements?.[0];

      if (!element || element?.status === 'ZERO_RESULTS' || json?.status !== 'OK') {
        // Intentar con Routes API como fallback mejorado
        const routesAlt = await this.getRoutes({
          origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
          destination: { location: { latLng: { latitude: destinationLat, longitude: destinationLng } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
          computeAlternativeRoutes: false,
          languageCode: 'es-CL',
          units: 'METRIC',
        });
        const r = routesAlt?.routes?.[0];
        if (r?.distanceMeters && r?.duration) {
          const km = Math.max(0, Math.round(Number(r.distanceMeters) / 1000));
          const secs = Number(String(r.duration).replace(/[^0-9]/g, '')) || 0;
          const mins = Math.max(0, Math.round(secs / 60));
          const duration = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
          return { distance: `${km} km`, duration, source: 'routes' };
        }
        // Intentar OSRM
        const osrm = await tryOsrm(originLat, originLng, destinationLat, destinationLng);
        if (osrm) return osrm;
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      const distance = element?.distance?.text ?? '';
      const duration = element?.duration?.text ?? '';

      if (!distance || !duration) {
        // Intentar con Routes API como fallback mejorado
        const routesAlt = await this.getRoutes({
          origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
          destination: { location: { latLng: { latitude: destinationLat, longitude: destinationLng } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
          computeAlternativeRoutes: false,
          languageCode: 'es-CL',
          units: 'METRIC',
        });
        const r = routesAlt?.routes?.[0];
        if (r?.distanceMeters && r?.duration) {
          const km = Math.max(0, Math.round(Number(r.distanceMeters) / 1000));
          const secs = Number(String(r.duration).replace(/[^0-9]/g, '')) || 0;
          const mins = Math.max(0, Math.round(secs / 60));
          const duration2 = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
          return { distance: `${km} km`, duration: duration2, source: 'routes' };
        }
        // Intentar OSRM
        const osrm = await tryOsrm(originLat, originLng, destinationLat, destinationLng);
        if (osrm) return osrm;
        return safeFallback(originLat, originLng, destinationLat, destinationLng);
      }

      return { distance, duration, source: 'distance_matrix' };
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
