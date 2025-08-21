
import ApiService from './api';

/**
 * Servicio de Usuarios
 * Gestiona operaciones generales de usuarios
 */
export class UserService {
  static async getUsers(): Promise<any[]> {
    return await ApiService.get('/users');
  }

  static async getUserForAdmin(userId: string): Promise<any> {
    return await ApiService.get(`/admin/users/${userId}`);
  }

  static async getPreferences(): Promise<any[]> {
    return await ApiService.get('/preferences');
  }

  static async getUserById(userId: string): Promise<any> {
    return await ApiService.get(`/users/${userId}`);
  }

  static async updateUser(userId: string, userData: any): Promise<any> {
    return await ApiService.put(`/users/${userId}`, userData);
  }

  static async deleteUser(userId: string): Promise<void> {
    await ApiService.delete(`/users/${userId}`);
  }

  static async getUserProfile(): Promise<any> {
    return await ApiService.get('/users/profile');
  }

  static async updateUserProfile(customerId, profileData: any): Promise<any> {
    return await ApiService.patch(`/users/${customerId}`, profileData);
  }

  static async updateUserPreference(profileData: any): Promise<any> {
    return await ApiService.patch(`/preferences`, profileData);
  }
}

export default UserService;
