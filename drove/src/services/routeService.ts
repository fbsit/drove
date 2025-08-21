
import ApiService from './api';

/**
 * Servicio de Rutas
 * Gestiona cálculo de rutas y distancias
 */
export class RouteService {
  static async computeRoute(routeData: { origin: string; destination: string }): Promise<any> {
    return await ApiService.post('/routes/compute', routeData);
  }

  static async getDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<any> {
    const qs = new URLSearchParams({
      originLat: originLat.toString(),
      originLng: originLng.toString(),
      destinationLat: destinationLat.toString(),
      destinationLng: destinationLng.toString(),
    }).toString();

    return ApiService.get(`/routes/distance?${qs}`);
  }
}

export default RouteService;
