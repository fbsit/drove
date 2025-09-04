
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { Client } from '@/types/admin';

export const useClientsManagement = (params?: { type?: 'empresa' | 'persona' | 'todos'; status?: string; search?: string }) => {
  const queryClient = useQueryClient();

  const effectiveType = params?.type && params.type !== 'todos' ? params.type : undefined;

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['admin-clients', effectiveType, params?.status, params?.search],
    queryFn: async (): Promise<Client[]> => {
      console.log('[CLIENTS] 🔄 Obteniendo clientes...');
      try {
        const response = await AdminService.getClients({ type: effectiveType, status: params?.status, search: params?.search });
        console.log('[CLIENTS] ✅ Clientes obtenidos:', response);
        
        return response.map((client: any): Client => {
          const fullName = client?.contactInfo?.fullName || client?.full_name || client?.nombre || 'Cliente';
          const statusRaw = (client?.status || '').toString().toUpperCase();
          const estado = statusRaw === 'PENDING'
            ? 'pendiente'
            : statusRaw === 'APPROVED'
            ? 'aprobado'
            : statusRaw === 'REJECTED'
            ? 'rechazado'
            : 'pendiente';

          return {
            id: client.id,
            nombre: fullName,
            email: client.email,
            tipo: client.company_name ? 'empresa' : 'persona',
            estado,
            fecha: client.created_at || client.createdAt || new Date().toISOString(),
            full_name: client.full_name,
            phone: client.phone,
            company_name: client.company_name,
            status: client.status,
          } as Client & any;
        });
      } catch (error) {
        console.error('[CLIENTS] ❌ Error al obtener clientes:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los clientes."
        });
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const approveClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      return AdminService.updateClient(clientId, { status: 'active' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      toast({
        title: "Cliente aprobado",
        description: "El cliente ha sido aprobado exitosamente."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aprobar el cliente."
      });
    }
  });

  const rejectClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      return AdminService.updateClient(clientId, { status: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      toast({
        title: "Cliente rechazado",
        description: "El cliente ha sido rechazado."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo rechazar el cliente."
      });
    }
  });

  return {
    clients,
    isLoading,
    approveClient: approveClientMutation.mutate,
    rejectClient: rejectClientMutation.mutate,
    isApproving: approveClientMutation.isPending,
    isRejecting: rejectClientMutation.isPending,
  };
};
