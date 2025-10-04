import ApiService from './api';

export interface UserDetails {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  status: string;
  role: string;
}

interface UsersResponse {
  users: UserDetails[];
}

export interface TicketStatusDTO { 
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}
export interface TicketReplyDTO { 
  response: string;
}

export interface RespondReviewDTO { response: string }

export interface EmptyPayload {}  

/**
 * Servicio de Administración
 * Gestiona usuarios, traslados, facturación, reportes y soporte
 */
export class AdminService {

  /** GET /admin/reports */
  static async getReports(): Promise<any> {
    return ApiService.get('/admin/reports');
  }
  
  /* GET /reviews - Obtener todas las reseñas desde admin */
  static async getReviews(): Promise<any[]> {
    return ApiService.get('/reviews');
  }

  /* POST /reviews/{id}/respond - Responder a una reseña */
  static async respondReview(reviewId: string, dto: RespondReviewDTO) {
    return ApiService.post(`/reviews/${reviewId}/respond`, dto);
  }

  /* POST /reviews/{id}/viewed - Marcar reseña como vista */
  static async markReviewViewed(reviewId: string) {
    return ApiService.post(`/reviews/${reviewId}/viewed`, {});
  }

  static async uploadInvoice(
    form: FormData,
  ): Promise<{ url: string }> {
    const result = await ApiService.post<{ url: string }>(
      '/storage/upload/invoice',
      form,
    );

    return result;
  }

  // === GESTIÓN DE USUARIOS ===
  static async getAllUsers(): Promise<UserDetails[]> {
    const response = await ApiService.get<UsersResponse>('/admin/users');
    return response.users || [];
  }

  static async getPendingUsers(): Promise<UserDetails[]> {
    const response = await ApiService.get<UsersResponse>('/admin/users/pending');
    return response.users || [];
  }

  static async getActiveUsers(): Promise<UserDetails[]> {
    const response = await ApiService.get<UsersResponse>('/admin/users/active');
    return response.users || [];
  }

  static async approveUser(userId: string): Promise<EmptyPayload> {
    return await ApiService.get(`/admin/users/${userId}/approve`);
  }

  static async rejectUser(userId: string): Promise<EmptyPayload> {
    return await ApiService.get(`/admin/users/${userId}/reject`);
  }

  // === GESTIÓN DE CLIENTES ===
  static async getClients(params?: { type?: 'empresa' | 'persona'; status?: string; search?: string }): Promise<any[]> {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const endpoint = qs.toString() ? `/users/role/client?${qs.toString()}` : '/users/role/client';
    return await ApiService.get(endpoint);
  }

  // Obtener resumen/Detalle de cliente para el panel
  static async getClientSummary(userId: string): Promise<any> {
    return await ApiService.get(`/admin/users/${userId}`);
  }

  static async updateClient(clientId: string, data: any): Promise<void> {
    await ApiService.put(`/admin/clients/${clientId}`, data);
  }

  static async approveClient(clientId: string): Promise<void> {
    await ApiService.post(`/admin/clients/${clientId}/approve`, {});
  }

  static async rejectClient(clientId: string): Promise<void> {
    await ApiService.post(`/admin/clients/${clientId}/reject`, {});
  }

  // === GESTIÓN DE DROVERS ===
  static async getDrovers(): Promise<any[]> {
    // Por defecto, traer sólo disponibles para la UI de asignación
    return await ApiService.get('/users/role/drover?available=true');
  }

  static async approveDrover(droverId: string): Promise<void> {
    await ApiService.post(`/admin/drovers/${droverId}/approve`, {});
  }

  static async rejectDrover(droverId: string): Promise<void> {
    await ApiService.post(`/admin/drovers/${droverId}/reject`, {});
  }

  // Actualizar usuario (empleo del drover, etc.)
  static async updateUser(userId: string, data: any): Promise<void> {
    await ApiService.put(`/users/${userId}`, data);
  }

  // === GESTIÓN DE TRASLADOS ===
  static async getTransfers(params?: { search?: string; status?: string; from?: string; to?: string }): Promise<any[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const endpoint = qs.toString() ? `/admin/transfers?${qs.toString()}` : '/admin/transfers';
    return await ApiService.get(endpoint);
  }

  static async assignDriver(transferId: string, droverId: string, adminId: string): Promise<void> {
    await ApiService.post(`/admin/transfers/${transferId}/assign`, { adminId, droverId });
  }

  static async updateTransferStatus(transferId: string, status: string): Promise<void> {
    await ApiService.put(`/admin/transfers/${transferId}/status`, { status });
  }

  static async cancelTransfer(transferId: string, reason: string, adminId?: string): Promise<boolean> {
    return await ApiService.post(`/admin/transfers/${transferId}/cancel`, { reason, adminId });
  }

  // === MÉTRICAS Y REPORTES ===
  static async getBusinessMetrics(): Promise<any> {
    return await ApiService.get('/admin/metrics');
  }

  static async getAnalytics(dateRange?: any): Promise<any> {
    const endpoint = dateRange ?
      `/admin/analytics?from=${dateRange.from}&to=${dateRange.to}` :
      '/admin/analytics';
    return await ApiService.get(endpoint);
  }

  static async generateReport(filters): Promise<any> {
    return await ApiService.post('/admin/reports/generate', { filters });
  }

  // === FACTURACIÓN ===
  static async getAllInvoices(params?: {
    search?: string;
    status?: string;
    clientId?: string;
    clientName?: string;
    transferStatus?: string;
    droverId?: string;
    droverName?: string;
    from?: string;
    to?: string;
    method?: string;
    onlyPending?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.clientId) qs.set('clientId', params.clientId);
    if (params?.clientName) qs.set('clientName', params.clientName);
    if (params?.transferStatus) qs.set('transferStatus', params.transferStatus);
    if (params?.droverId) qs.set('droverId', params.droverId);
    if (params?.droverName) qs.set('droverName', params.droverName);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.method) qs.set('method', params.method);
    if (typeof params?.onlyPending === 'boolean') qs.set('onlyPending', String(params.onlyPending));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const endpoint = qs.toString() ? `/invoices?${qs.toString()}` : '/invoices';
    return await ApiService.get(endpoint);
  }

  static async getPendingInvoices(): Promise<any[]> {
    return await ApiService.get('/admin/invoices/pending');
  }

  static async generateInvoice(transferId: string): Promise<any> {
    return await ApiService.post('/admin/invoices/generate', { transferId });
  }

  static async issueInvoice(invoiceId: string): Promise<any> {
    return await ApiService.post(`/admin/invoices/${invoiceId}/issue`, {});
  }

  static async updateInvoiceStatus(invoiceId: string, status: 'emitida' | 'anticipo' | 'pagada' | 'rejected' | 'voided'): Promise<void> {
    await ApiService.put(`/admin/invoices/${invoiceId}/status`, { status });
  }

  // === PAGOS ===
  static async getPayments(params?: { search?: string; status?: string; method?: string; from?: string; to?: string }): Promise<any[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.method) qs.set('method', params.method);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const endpoint = qs.toString() ? `/payments?${qs.toString()}` : '/payments';
    return await ApiService.get(endpoint);
  }

  // === SOPORTE ===
  static async getSupportTickets(params?: { search?: string; status?: string; priority?: string }): Promise<any[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.priority) qs.set('priority', params.priority);
    const endpoint = qs.toString() ? `/admin/support/tickets?${qs.toString()}` : '/admin/support/tickets';
    return await ApiService.get(endpoint);
  }

  static async createSupportTicket(payload: { name: string; email: string; subject: string; message: string }): Promise<any> {
    return await ApiService.post('/support/tickets', payload);
  }

  static async updateTicketStatus(ticketId: string, dto: TicketStatusDTO): Promise<void> {
    await ApiService.put(`/admin/support/tickets/${ticketId}/status`, dto);
  }

  static async respondToTicket(ticketId: string, dto: TicketReplyDTO): Promise<void> {
    await ApiService.post(`/admin/support/tickets/${ticketId}/respond`, dto);
  }

  static async closeTicket(ticketId: string): Promise<void> {
    await ApiService.put(`/admin/support/tickets/${ticketId}/close`, {});
  }

  // === JEFES DE TRÁFICO ===
  static async getTrafficManagers(): Promise<any[]> {
    return await ApiService.get('/users/role/trafficboss');
  }

  static async inviteTrafficManager(email: string): Promise<any> {
    return await ApiService.post('/admin/traffic-managers/invite', { email });
  }

  static async activateTrafficManager(id: string): Promise<void> {
    await ApiService.post(`/admin/traffic-managers/${id}/activate`, {});
  }

  static async deactivateTrafficManager(id: string): Promise<void> {
    await ApiService.post(`/admin/traffic-managers/${id}/deactivate`, {});
  }

  static async deleteTrafficManager(id: string): Promise<void> {
    await ApiService.delete(`/admin/traffic-managers/${id}`);
  }
}

// Re-exports para compatibilidad
export const getAllUsers = AdminService.getAllUsers;
export const getPendingUsers = AdminService.getPendingUsers;
export const getActiveUsers = AdminService.getActiveUsers;
export const approveUser = AdminService.approveUser;
export const rejectUser = AdminService.rejectUser;
export const assignDriver = AdminService.assignDriver;
