
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

interface DashboardMetrics {
  users: { total: number; pending: number };
  transfers: { total: number; active: number };
  reviews: { total: number; average: number };
  completedTransfers?: number;
  inProgressTransfers?: number;
  assignedTransfers?: number;
  pendingTransfers?: number;
}

export const useAdminDashboard = () => {
  const {
    data: metrics = {
      users: { total: 0, pending: 0 },
      transfers: { total: 0, active: 0 },
      reviews: { total: 0, average: 0 },
      completedTransfers: 0,
      inProgressTransfers: 0,
      assignedTransfers: 0,
      pendingTransfers: 0,
    },
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: async () => {
      console.log('[ADMIN_DASHBOARD] 🔄 Obteniendo métricas del dashboard...');

      // 1. Llamada a la API
      const res = await AdminService.getBusinessMetrics();

      // 2. Normaliza: si viene de Axios, usa res.data; si no, usa res directo
      const data = res?.data ?? res;

      console.log('[ADMIN_DASHBOARD] ✅ Métricas obtenidas:', data);

      // 3. Mapea a la forma que espera el front
      return {
        users: {
          total: data?.users?.total ?? 0,
          pending: data?.users?.pending ?? 0,
        },

        transfers: {
          total: data?.totalTransfers ?? 0,
          active: data?.transfers?.active ?? 0,
        },

        reviews: {
          total: data?.totalRevenue ?? 0,
          average:
            data?.totalTransfers && data.totalTransfers > 0
              ? (data.totalRevenue ?? 0) / data.totalTransfers
              : 0,
        },
        completedTransfers: data?.transferStatus?.find?.((s: any) => s.status === 'DELIVERED')?.count ?? 0,
        inProgressTransfers: data?.transferStatus?.find?.((s: any) => s.status === 'IN_PROGRESS')?.count ?? 0,
        assignedTransfers: data?.transferStatus?.find?.((s: any) => s.status === 'ASSIGNED')?.count ?? 0,
        pendingTransfers: data?.transferStatus?.find?.((s: any) => s.status === 'CREATED')?.count ?? 0,
      };
    },
    // 4. Valores placeholder hasta que llegue la data “real”
    placeholderData: {
      users: { total: 0, pending: 0 },
      transfers: { total: 0, active: 0 },
      reviews: { total: 0, average: 0 },
      completedTransfers: 0,
      inProgressTransfers: 0,
      assignedTransfers: 0,
      pendingTransfers: 0,
    },
    refetchInterval: 300_000, // 5 min
    retry: 3,
  });

  // Traslados recientes (últimos 5)
  const { data: recentTransfers = [] } = useQuery({
    queryKey: ['admin-dashboard-recent-transfers'],
    queryFn: async () => {
      const list = await AdminService.getTransfers({});
      // ordenar por createdAt desc si viene, tomar 5
      const arr = Array.isArray(list?.transfers) ? list.transfers : (Array.isArray(list) ? list : []);
      return arr.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
    },
    staleTime: 60_000,
  });

  console.log("metricas finales", metrics);

  return { metrics, recentTransfers, isLoading, error };
};
