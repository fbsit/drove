
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { Client } from '@/types/admin';

export const useClientsManagement = () => {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async (): Promise<Client[]> => {
      console.log('[CLIENTS] 🔄 Obteniendo clientes...');
      try {
        const response = await AdminService.getClients();
        console.log('[CLIENTS] ✅ Clientes obtenidos:', response);
        
        return response.map((client: any): Client => ({
          id: client.id,
          nombre: client.contactInfo.fullName || client.nombre || 'Cliente',
          email: client.email,
          tipo: client.company_name ? 'empresa' : 'individual',
          estado: client.status === 'active' ? 'activo' : 'inactivo',
          fecha: client.created_at || new Date().toISOString(),
          full_name: client.full_name,
          phone: client.phone,
          company_name: client.company_name,
          status: client.status
        }));
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
