
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
    return await ApiService.post('/support/tickets', ticketData);
  }

  static async updateTicket(ticketId: string, ticketData: any): Promise<any> {
    return await ApiService.put(`/admin/support/tickets/${ticketId}/status`, ticketData);
  }

  static async closeTicket(ticketId: string): Promise<any> {
    return await ApiService.put(`/admin/support/tickets/${ticketId}/close`, {});
  }

  static async respondToTicket(ticketId: string, response: string): Promise<any> {
    return await ApiService.post(`/admin/support/tickets/${ticketId}/respond`, { response });
  }
}

export default SupportService;
