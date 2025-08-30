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

      const paymentMethods = (r.paymentMethods || []).map((m: any) => ({
        name: String(m.method || m.name || '').toUpperCase() === 'STRIPE' ? 'Tarjeta (Stripe)' : 'Transferencia',
        value: Number(m.amount || m.value || 0),
      }));

      const paymentStatus = (r.paymentStatus || []).map((p: any) => ({
        name: p.status || p.name,
        value: Number(p.count || p.value || 0),
        color: p.color || '#6EF7FF',
      }));

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
