
import ApiService from './api';

/**
 * Servicio de Drover
 * Gestiona dashboard, viajes, perfil y estado del drover
 */
export class DroverService {
  // === DASHBOARD ===
  static async getDroverDashboard(): Promise<any> {
    return await ApiService.get('/users/drover/dashboard');
  }

  static async getDroverStats(): Promise <any>{
    // No existe en backend; devolvemos dashboard básico o implementar en backend
    const dashboard = await ApiService.get('/users/drover/dashboard');
    return dashboard?.stats ?? dashboard ?? {};
  }

  // === GESTIÓN DE VIAJES ===
  static async getAvailableTrips(droverId): Promise<any[]> {
    return await ApiService.get(`/travels/drover/${droverId}`);
  }

  static async getMyTrips(): Promise<any[]> {
    // No existe en backend; se podría derivar a /travels/drover/:id
    const userId = localStorage.getItem('auth_user_id');
    if (!userId) return [];
    return await ApiService.get(`/travels/drover/${userId}`);
  }

  static async acceptTrip(tripId: string): Promise<any> {
    // No existe endpoint; simulamos aceptando como ASSIGNED con el drover actual
    const droverId = localStorage.getItem('auth_user_id');
    if (!droverId) throw new Error('No drover id');
    return await ApiService.patch(`/travels/${tripId}/status`, { status: 'ASSIGNED', droverId });
  }

  static async updateTripStatus(tripId: string, status: string): Promise<any> {
    return await ApiService.patch(`/travels/${tripId}/status`, { status });
  }

  // === PERFIL ===
  static async getProfile(): Promise<any> {
    return await ApiService.get('/users/profile');
  }

  static async updateProfile(profileData: any): Promise<any> {
    const userId = localStorage.getItem('auth_user_id');
    if (!userId) throw new Error('No user id');
    return await ApiService.patch(`/users/${userId}`, { contactInfo: profileData });
  }
}

export default DroverService;
