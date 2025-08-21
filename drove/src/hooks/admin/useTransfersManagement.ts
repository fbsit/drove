
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TransferData {
  id: string;
  clientName: string;
  clientEmail: string;
  droverId?: string;
  droverName?: string;
  origin: string;
  destination: string;
  status: string;
  scheduledDate: string;
  vehicleType: string;
  price: number;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  distance: string;
}

export const useTransfersManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading, refetch: refetchTransfer } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: async (): Promise<TransferData[]> => {
      console.log('[TRANSFERS] 🔄 Obteniendo traslados...');
      try {
        const response = await AdminService.getTransfers();
        console.log('[TRANSFERS] ✅ Traslados obtenidos:', response);
        return response?.transfers?.map((transfer: any): TransferData => ({
          id: `${transfer?.id}` || `transfer-${Date.now()}`,
          clientName: transfer.client?.contactInfo?.fullName || transfer.client_name || 'Cliente',
          clientEmail: transfer.client?.email || transfer.client_email || 'No email',
          droverId: transfer.drover?.id || transfer.drover_id || '',
          droverName: transfer.drover?.contactInfo?.fullName || transfer.drover_name,
          origin: transfer?.startAddress?.city || transfer.pickup_address || '',
          destination: transfer?.endAddress?.city || transfer.destination_address || '',
          status: transfer.status || 'pending',
          scheduledDate: transfer.travelDate || transfer.pickup_date || new Date().toISOString(),
          vehicleType: transfer.typeVehicle || transfer.vehicle_type || 'coche',
          price: transfer.totalPrice || 0,
          brand: transfer.brandVehicle || transfer.vehicle_brand || 'Desconocido',
          model: transfer.modelVehicle || transfer.vehicle_model || 'Desconocido',
          year: transfer.yearVehicle || transfer.vehicle_year || 'Desconocido',
          licensePlate: transfer.licensePlate || transfer.vehicle_license_plate || 'Desconocido',
          distance: transfer.distanceTravel || '0 km',
        }));
      } catch (error) {
        console.error('[TRANSFERS] ❌ Error al obtener traslados:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los traslados."
        });
        return [];
      }
    },
    refetchInterval: 60000,
  });

   const { data: drovers = [], isLoadingDrovers } = useQuery({
    queryKey: ['admin-drover'],
    queryFn: async (): Promise<TransferData[]> => {
      try {
        console.log('[TRANSFERS] 🔄 Obteniendo drovers...');
        const response = await AdminService.getDrovers();
        return response;
      } catch (error) {
        console.error('[TRANSFERS] ❌ Error al obtener drovers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los traslados."
        });
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ transferId, driverId }: { transferId: string; driverId: string }) => {
      console.log('[TRANSFERS] 🔄 Asignando conductor:', { transferId, driverId });
      return await AdminService.assignDriver(transferId, driverId, user.id);
    },
    onSuccess: () => {
      console.log('[TRANSFERS] ✅ Conductor asignado');
      refetchTransfer();
      toast({
        title: "Conductor asignado",
        description: "El conductor ha sido asignado al traslado."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
    },
    onError: (error: any) => {
      console.error('[TRANSFERS] ❌ Error al asignar conductor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo asignar el conductor."
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ transferId, status }: { transferId: string; status: string }) => {
      console.log('[TRANSFERS] 🔄 Actualizando estado:', { transferId, status });
      return await AdminService.updateTransferStatus(transferId, status);
    },
    onSuccess: () => {
      console.log('[TRANSFERS] ✅ Estado actualizado');
      toast({
        title: "Estado actualizado",
        description: "El estado del traslado ha sido actualizado."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
    },
    onError: (error: any) => {
      console.error('[TRANSFERS] ❌ Error al actualizar estado:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado del traslado."
      });
    }
  });

  return {
    transfers,
    drovers,
    isLoadingDrovers,
    isLoading,
    assignDriver: (transferId: string, driverId: string) => 
      assignDriverMutation.mutate({ transferId, driverId }),
    updateTransferStatus: (transferId: string, status: string) => 
      updateStatusMutation.mutate({ transferId, status }),
    isAssigning: assignDriverMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
};
