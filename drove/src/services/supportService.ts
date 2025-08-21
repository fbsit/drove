
import ApiService from './api';

/**
 * Servicio de Soporte
 * Gestiona tickets de soporte y comunicación con usuarios
 */
export class SupportService {
  static async getTickets(): Promise<any[]> {
    return await ApiService.get('/admin/support/tickets');
  }

  static async createTicket(ticketData: any): Promise<any> {
    // Si se requiere público, crear endpoint; por ahora admin namespace no tiene POST create
    return await ApiService.post('/admin/support/tickets', ticketData);
  }

  static async updateTicket(ticketId: string, ticketData: any): Promise<any> {
    return await ApiService.put(`/admin/support/tickets/${ticketId}/status`, ticketData);
  }

  static async closeTicket(ticketId: string): Promise<any> {
    return await ApiService.put(`/admin/support/tickets/${ticketId}/close`, {});
  }
}

export default SupportService;
