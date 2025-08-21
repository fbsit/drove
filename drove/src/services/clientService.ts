
import ApiService from './api';

/**
 * Servicio de Cliente
 * Gestiona traslados, perfil y reseñas del cliente
 */
export class ClientService {
  // === GESTIÓN DE TRASLADOS ===
  static async createTransfer(transferData: any): Promise<any> {
    // Usar /travels; backend toma usuario autenticado desde JWT
    return await ApiService.post('/travels', transferData);
  }

  static async getMyTransfers(): Promise<any[]> {
    const userId = localStorage.getItem('auth_user_id');
    if (!userId) return [];
    return await ApiService.get(`/travels/client/${userId}`);
  }

  static async getTransferById(transferId: string): Promise<any> {
    return await ApiService.get(`/travels/${transferId}`);
  }

  static async cancelTransfer(transferId: string): Promise<void> {
    await ApiService.patch(`/travels/${transferId}/status`, { status: 'CANCELLED' });
  }

  // === RESEÑAS ===
  static async submitReview(transferId: string, reviewData: any): Promise<any> {
    // Backend crea reseña vía POST /reviews con { travelId, rating, comment }
    return await ApiService.post(`/reviews`, { travelId: transferId, ...reviewData });
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

export default ClientService;
