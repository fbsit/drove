
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { Drover } from '@/types/admin';

export const useDroversManagement = () => {
  const queryClient = useQueryClient();

  const { data: drovers = [], isLoading } = useQuery({
    queryKey: ['admin-drovers'],
    queryFn: async (): Promise<Drover[]> => {
      console.log('[DROVERS] 🔄 Obteniendo drovers...');
      try {
        const response = await AdminService.getDrovers();
        console.log('[DROVERS] ✅ Drovers obtenidos:', response);
        
        return response.map((drover: any): Drover => ({
          id: drover.id,
          nombre: drover?.contactInfo?.fullName || drover.nombre || 'Drover',
          email: drover.email,
          estado: drover.status === 'active' ? 'disponible' : 'inactivo',
          traslados: 0,
          calificacion: 5.0,
          ubicacion: drover.city || 'No especificada',
          telefono: drover.phone || '',
          full_name: drover.full_name,
          phone: drover.phone,
          status: drover.status,
          role: drover.role,
          company_name: drover.company_name,
          avatar: drover?.contactInfo?.selfie || drover?.selfie || undefined,
        }));
      } catch (error) {
        console.error('[DROVERS] ❌ Error al obtener drovers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los drovers."
        });
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const approveDroverMutation = useMutation({
    mutationFn: async (droverId: string) => {
      console.log('[DROVERS] 🔄 Aprobando drover:', droverId);
      return await AdminService.approveDrover(droverId);
    },
    onSuccess: () => {
      console.log('[DROVERS] ✅ Drover aprobado');
      toast({
        title: "Drover aprobado",
        description: "El drover ha sido aprobado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-drovers'] });
    },
    onError: (error: any) => {
      console.error('[DROVERS] ❌ Error al aprobar drover:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aprobar el drover."
      });
    }
  });

  const rejectDroverMutation = useMutation({
    mutationFn: async (droverId: string) => {
      console.log('[DROVERS] 🔄 Rechazando drover:', droverId);
      return await AdminService.rejectDrover(droverId);
    },
    onSuccess: () => {
      console.log('[DROVERS] ✅ Drover rechazado');
      toast({
        title: "Drover rechazado",
        description: "El drover ha sido rechazado."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-drovers'] });
    },
    onError: (error: any) => {
      console.error('[DROVERS] ❌ Error al rechazar drover:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo rechazar el drover."
      });
    }
  });

  return {
    drovers,
    isLoading,
    approveDrover: (droverId: string) => approveDroverMutation.mutate(droverId),
    rejectDrover: (droverId: string) => rejectDroverMutation.mutate(droverId),
    isApproving: approveDroverMutation.isPending,
    isRejecting: rejectDroverMutation.isPending,
  };
};
