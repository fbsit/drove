
export interface Client {
  id: string;
  nombre: string;
  email: string;
  tipo: 'individual' | 'empresa';
  estado: 'activo' | 'inactivo';
  fecha: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
  status?: string;
}

export interface Drover {
  id: string;
  nombre: string;
  email: string;
  estado: 'disponible' | 'ocupado' | 'inactivo';
  traslados: number;
  calificacion: number;
  ubicacion: string;
  telefono: string;
  full_name?: string;
  phone?: string;
  status?: string;
  role?: string;
  company_name?: string;
  tiempo?: string;
  tipoDrover?: string;
}

export interface TrafficManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  invited: boolean;
  assignedTransfers: number;
  createdAt: string;
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  clientName: string;
  droverName: string;
  transferId: string;
  createdAt: string;
  adminResponse?: string;
  isViewed?: boolean;
}

export interface InvoiceData {
  id: string;
  transferId: string;
  clientName: string;
  client: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  invoiceStatus: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paymentDate?: string;
  createdAt: string;
  type: string;
  method: string;
}

export interface ReportData {
  totalTransfers: number;
  totalRevenue: number;
  activeDrivers: number;
  completionRate: number;
  monthlyGrowth: number;
  transfers: number;
  revenue: number;
  drivers: number;
  clients: number;
  topRoutes: Array<{
    route: string;
    count: number;
  }>;
  paymentMethods: Array<{
    method: string;
    percentage: number;
  }>;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customer: string;
  clientName?: string;
  clientEmail?: string;
  created: string;
  message?: string;
  createdAt?: string;
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  avgResponseTime: string;
  total: number;
  open: number;
  closed: number;
  inProgress: number;
  resolved?: number;
  urgent?: number;
}
