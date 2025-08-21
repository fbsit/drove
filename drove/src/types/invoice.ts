
export interface Invoice {
  id: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  client: string;
  transferId: string;
  amount: number;
  status: "emitida" | "anticipo" | "pagada";
  issueDate: string;
  dueDate: string;
  description: string;
  pdfUrl?: string;
  pdf?: string;
  paymentMethod: "transferencia" | "tarjeta" | "debito";
  transferStatus: string;
  createdAt: string;
  notes: string;
}
