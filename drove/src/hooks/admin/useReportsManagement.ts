import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService, ReportData } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

const EMPTY_REPORT: ReportData = {
  totalTransfers: 0,
  totalRevenue:   0,
  activeDrivers:  0,
  completionRate: 0,
  monthlyGrowth:  0,
  transfers:      0,
  revenue:        0,
  drivers:        0,
  clients:        0,
  topRoutes:      [],
  paymentMethods: [],
};

export const useReportsManagement = () => {
  const qc = useQueryClient();

  /* ─────────── Obtener reportes ─────────── */
  const {
    data: reports = EMPTY_REPORT,
    isLoading,
  } = useQuery<ReportData>({
    queryKey: ['admin-reports'],
    queryFn:   async () => {
      const r: any = await AdminService.getReports();
      // Normalizar estructuras para las gráficas
      const statusMap: Record<string, string> = {
        CREATED: 'Creado',
        ASSIGNED: 'Asignado',
        IN_PROGRESS: 'En Progreso',
        DELIVERED: 'Entregado',
        PICKED_UP: 'Recogido',
        REQUEST_FINISH: 'Solicita Finalizar',
        CANCELLED: 'Cancelado',
      };
      const transferStatus = (r.transferStatus || r.status || []).map((s: any) => ({
        name: statusMap[s.status] || s.status || 'Otro',
        value: Number(s.count || s.value || 0),
      }));

      let paymentMethods = (r.paymentMethods || []).map((m: any) => ({
        name: String(m.method || m.name || '').toUpperCase() === 'STRIPE' ? 'Tarjeta (Stripe)' : 'Transferencia',
        value: Number(m.amount || m.value || 0),
      }));

      let paymentStatus = (r.paymentStatus || []).map((p: any) => ({
        name: p.status || p.name,
        value: Number(p.count || p.value || 0),
        color: p.color || '#6EF7FF',
      }));

      // Fallback: si el backend no entregó métricas de pagos, agrégalas a partir de /payments
      if ((!paymentMethods || paymentMethods.length === 0) || (!paymentStatus || paymentStatus.length === 0)) {
        try {
          const payments: any[] = await AdminService.getPayments();
          // Métodos
          const byMethod: Record<string, number> = {};
          // Estados
          const byStatus: Record<string, number> = {};
          payments.forEach((p: any) => {
            const methodKey = String(p.method || p.paymentMethod || '').toUpperCase();
            const statusKey = String(p.status || '').toUpperCase();
            const amount = Number(p.amount || p.total || 0);
            byMethod[methodKey] = (byMethod[methodKey] || 0) + amount;
            byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;
          });
          const methodMap: Record<string,string> = { STRIPE: 'Tarjeta (Stripe)', CARD: 'Tarjeta (Stripe)', TRANSFER: 'Transferencia', BANK_TRANSFER: 'Transferencia' };
          paymentMethods = Object.entries(byMethod).map(([k,v]) => ({ name: methodMap[k] || k, value: v }));
          const statusColor: Record<string,string> = { PENDING: '#FFD166', CONFIRMED: '#06D6A0', PAID: '#06D6A0', FAILED: '#FF6B6B', CANCELLED: '#FF6B6B', REFUNDED: '#6EF7FF' };
          paymentStatus = Object.entries(byStatus).map(([k,v]) => ({ name: k, value: v as number, color: statusColor[k] || '#6EF7FF' }));
        } catch {}
      }

      return {
        ...r,
        transferStatus,
        paymentMethods,
        paymentStatus,
        revenue: Number(r.revenue || r.totalRevenue || 0),
        transfers: Number(r.transfers || r.totalTransfers || 0),
        drivers: Number(r.drivers || r.activeDrivers || 0),
      } as ReportData as any;
    },
    refetchInterval: 300_000, // 5 min
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los reportes.',
      }),
  });

  /* ─────────── Generar reporte ─────────── */
  const generateReport = useMutation({
    mutationFn: ({ type, dateRange }: { type: string; dateRange?: any }) =>
      AdminService.generateReport({ type, dateRange }),
    onSuccess: () => {
      toast({ title: 'Reporte generado', description: 'Reporte generado exitosamente.' });
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo generar el reporte.',
      }),
  });

  /* Puedes renombrar `reports` a `analytics` si lo prefieres */
  return {
    reports,
    analytics: reports,
    isLoading,
    generateReport: generateReport.mutate,
    isGeneratingReport: generateReport.isPending,
  };
};
