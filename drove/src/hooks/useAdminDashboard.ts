
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

interface DashboardMetrics {
  amount: number; // Total revenue
  users: {
    total: number;
    pending: number;
  };
  transfers: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    average: number;
  };
}

export const useAdminDashboard = () => {
  const {
    data: metrics = {
      amount: 0,
      users: { total: 0, pending: 0 },
      transfers: { total: 0, active: 0 },
      reviews: { total: 0, average: 0 },
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
      };
    },
    // 4. Valores placeholder hasta que llegue la data “real”
    placeholderData: {
      amount: 0,
      users: { total: 0, pending: 0 },
      transfers: { total: 0, active: 0 },
      reviews: { total: 0, average: 0 },
    },
    refetchInterval: 300_000, // 5 min
    retry: 3,
  });

  console.log("metricas finales", metrics);

  return { metrics, isLoading, error };
};
