
/**
 * Tipos para el servicio de administración
 */

// Cliente destacado
export interface TopClient {
  id: string;
  name: string;
  transferCount: number;
  totalSpent: number;
}

// Drover destacado
export interface TopDriver {
  id: string;
  name: string;
  transferCount: number;
  rating: number;
}

// Métricas del negocio
export interface BusinessMetricsResponse {
  totalTransfers: number;
  completedTransfers: number;
  inProgressTransfers: number;
  pendingTransfers: number;
  cardPayments: number;
  bankTransferPayments: number;
  topClients: TopClient[];
  topDrivers: TopDriver[];
}

// Pago pendiente
export interface PendingPayment {
  id: number;
  amount: number;
  paymentMethod: string;
  created_at: string;
  vehicle_transfers: {
    id: string;
    status: string;
    users: {
      full_name: string;
      email: string;
      company_name: string | null;
    };
    vehicle_details: {
      brand: string;
      model: string;
    };
    pickup_details: {
      originAddress: string;
      destinationAddress: string;
    };
  };
}

// Respuesta de pagos pendientes
export interface PendingPaymentsResponse {
  payments: PendingPayment[];
  filter?: (predicate: (payment: PendingPayment) => boolean) => PendingPayment[];
  length?: number;
}

// Solicitud de confirmación de pago
export interface ConfirmPaymentRequest {
  paymentId: number;
  adminId: string;
}

// Respuesta de traslados (admin)
export interface AdminTransfersResponse {
  transfers: Array<{
    id: string;
    status: string;
    created_at: string;
    price: number;
    users: {
      full_name: string;
      email: string;
      company_name: string | null;
    };
    drivers: {
      full_name: string;
    } | null;
    pickup_details: {
      originAddress: string;
      destinationAddress: string;
    };
    vehicle_details: {
      brand: string;
      model: string;
    };
  }>;
}

// Solicitud de asignación de drover
export interface AssignDriverRequest {
  transferId: string;
  driverId: string;
  adminId: string;
}

// Factura pendiente
export interface PendingInvoice {
  id: number;
  created_at: string;
  transfer_id: string;
  vehicle_transfers: {
    id: string;
    status: string;
    users: {
      full_name: string;
      email: string;
      company_name: string | null;
    };
    vehicle_details: {
      brand: string;
      model: string;
    };
    pickup_details: {
      originAddress: string;
      destinationAddress: string;
    };
    payments: {
      amount: number;
      method: string;
    };
  };
}

// Respuesta de facturas pendientes
export interface PendingInvoicesResponse {
  invoices: PendingInvoice[];
  filter?: (predicate: (invoice: PendingInvoice) => boolean) => PendingInvoice[];
  length?: number;
}

// Solicitud de emisión de factura
export interface IssueInvoiceRequest {
  invoiceId: number;
  adminId: string;
  invoiceNumber: string;
}
