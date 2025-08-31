
import ApiService from './api';

/**
 * Servicio de Notificaciones
 * Gestiona notificaciones del usuario
 */
export class NotificationService {
  static async getNotifications(): Promise<any[]> {
    // Cache-busting via query param; no custom request headers to avoid CORS preflight issues
    const response = await ApiService.get(`/notifications?t=${Date.now()}`);
    // El backend retorna array directo
    return Array.isArray(response) ? response : (response?.notifications ?? []);
  }

  static async getUnreadCount(): Promise<number> {
    const response = await ApiService.get(`/notifications/unread-count?t=${Date.now()}`);
    if (typeof response === 'number') return response;
    return response?.count ?? 0;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    // Backend expone PATCH /notifications/:id para updates genéricos
    await ApiService.patch(`/notifications/${notificationId}`, { read: true });
  }

  static async markAllAsRead(): Promise<void> {
    // No existe endpoint; se podría iterar cliente-side si se listan primero
    throw new Error('mark-all-read no está soportado por el backend actual');
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    await ApiService.delete(`/notifications/${notificationId}`);
  }
}

export default NotificationService;
