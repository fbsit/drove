
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
    return await ApiService.get(`/travels/me`);
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

  static async updateCurrentPosition(lat: number, lng: number) {
    return ApiService.post('/users/me/current-position', { lat, lng });
  }

  static async setAvailability(isAvailable: boolean) {
    return ApiService.post('/users/me/availability', { isAvailable });
  }

  // === COMPENSACIONES ===
  static async getFreelanceCompensationForKm(km: number) {
    return ApiService.get(`/rates/compensation/freelance?km=${encodeURIComponent(String(km))}`);
  }

  static async getContractedMonthlyCompensation(droverId: string, monthISO: string) {
    return ApiService.get(`/rates/compensation/contracted?droverId=${encodeURIComponent(droverId)}&month=${encodeURIComponent(monthISO)}`);
  }

  static async previewCompensation(opts: { droverId: string; km?: number; month?: string }) {
    const params = new URLSearchParams();
    params.set('droverId', opts.droverId);
    if (typeof opts.km === 'number') params.set('km', String(opts.km));
    if (opts.month) params.set('month', opts.month);
    return ApiService.get(`/rates/compensation/preview?${params.toString()}`);
  }
}

export default DroverService;
