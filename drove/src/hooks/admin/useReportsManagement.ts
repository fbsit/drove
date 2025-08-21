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
    queryFn:   AdminService.getReports,
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
