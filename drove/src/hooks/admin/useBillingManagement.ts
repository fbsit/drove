
import { useState, useEffect } from 'react';
import { UseMutateFunction, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { AdminService } from '@/services/adminService';

export interface InvoiceData {
  id: string;
  client_id: string;
  client_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  transfer_id?: string;
}

export const useBillingManagement = () => {
  const [pendingPayments, setPendingPayments] = useState<InvoiceData[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<InvoiceData[]>([]);
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([]);

  const { data: invoices = [], isLoading, refetch } = useQuery<InvoiceData[]>({
    queryKey: ['invoices'],
    queryFn: AdminService.getAllInvoices,
    onSuccess: (data) => {
      const pending = data.filter(inv => inv.status === 'pending');
      setPendingInvoices(pending);
      setPendingPayments(pending); // si quieres diferenciar, podrías tener lógica extra
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las facturas.',
      });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (clientId: string) => {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Factura generada",
        description: "La factura se ha generado correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al generar la factura",
      });
    },
  });

  const issueInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Factura emitida",
        description: "La factura se ha emitido correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al emitir la factura",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Pago confirmado",
        description: "El pago se ha confirmado correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al confirmar el pago",
      });
    },
  });

  return {
    invoices,
    isLoading,
    pendingPayments,
    pendingInvoices,
    allInvoices,
    generateInvoice: generateInvoiceMutation.mutate,
    issueInvoice: issueInvoiceMutation.mutate,
    confirmPayment: confirmPaymentMutation.mutate,
    isGenerating: generateInvoiceMutation.isPending,
    isIssuing: issueInvoiceMutation.isPending,
    isConfirmingPayment: confirmPaymentMutation.isPending,
    isIssuingInvoice: issueInvoiceMutation.isPending,
  };
};
