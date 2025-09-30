import ApiService from './api';

/**
 * Servicio de Soporte (unificado)
 * - Métodos para usuario autenticado (cliente/drover): prefijo /support/my
 * - Métodos administrativos: prefijo /admin/support
 */
export class SupportService {
  // Usuario: obtener o crear ticket abierto
  static async getMyOpen(): Promise<any> {
    return ApiService.get('/support/my/open');
  }

  // Usuario: listar mis tickets
  static async getMyTickets(): Promise<any[]> {
    return ApiService.get('/support/my');
  }

  // Usuario: enviar mensaje a mi ticket abierto
  static async sendMyMessage(content: string): Promise<any> {
    return ApiService.post('/support/my/messages', { content });
  }

  // Usuario: cerrar mi ticket abierto
  static async closeMyTicket(): Promise<any> {
    return ApiService.put('/support/my/close');
  }

  // Delta para usuario autenticado
  static async getMyMessagesDelta(afterSeq: number): Promise<{ lastSeq: number; messages: any[] }> {
    return ApiService.get(`/support/my/messages?afterSeq=${afterSeq}`);
  }

  // Admin: delta por ticket
  static async getTicketMessagesDelta(ticketId: string, afterSeq: number): Promise<{ lastSeq: number; messages: any[] }> {
    return ApiService.get(`/admin/support/tickets/${ticketId}/messages`, { method: 'GET', body: JSON.stringify({ afterSeq }) } as any);
  }

  // Admin: listar todos los tickets
  static async getTickets(): Promise<any[]> {
    return ApiService.get('/admin/support/tickets');
  }

  // Admin: crear ticket (público)
  static async createTicket(ticketData: any): Promise<any> {
    return ApiService.post('/support/tickets', ticketData);
  }

  // Admin: actualizar estado de un ticket
  static async updateTicket(ticketId: string, ticketData: any): Promise<any> {
    return ApiService.put(`/admin/support/tickets/${ticketId}/status`, ticketData);
  }

  // Admin: cerrar ticket específico
  static async closeTicket(ticketId: string): Promise<any> {
    return ApiService.put(`/admin/support/tickets/${ticketId}/close`, {});
  }

  // Admin: responder a ticket
  static async respondToTicket(ticketId: string, response: string): Promise<any> {
    return ApiService.post(`/admin/support/tickets/${ticketId}/respond`, { response });
  }
}

export default SupportService;
