
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TransferData {
  id: string;
  createdAt?: string;
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

export const useTransfersManagement = (filters?: { search?: string; status?: string; from?: Date; to?: Date }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedValue(filters?.search ?? '', 300);
  const normalizedStatus = (filters?.status ?? 'todos');
  const from = filters?.from ? filters.from.toISOString().slice(0,10) : undefined;
  const to = filters?.to ? filters.to.toISOString().slice(0,10) : undefined;

  const { data: transfers = [], isLoading, refetch: refetchTransfer } = useQuery({
    queryKey: ['admin-transfers', { search: debouncedSearch, status: normalizedStatus, from, to }],
    queryFn: async ({ queryKey }): Promise<TransferData[]> => {
      const [, params] = queryKey as [string, { search?: string; status?: string; from?: string; to?: string }];
      console.log('[TRANSFERS] 🔄 Obteniendo traslados...');
      try {
        const response: any = await AdminService.getTransfers({
          search: params?.search || undefined,
          status: params?.status && params.status !== 'todos' ? params.status : undefined,
          from: params.from,
          to: params.to,
        });
        console.log('[TRANSFERS] ✅ Traslados obtenidos:', response);
        const list = (Array.isArray(response) ? response : response?.transfers || []);
        const totals = {
          totalTransfers: list.length,
          completedTransfers: list.filter((t:any)=>t.status==='DELIVERED').length,
          inProgressTransfers: list.filter((t:any)=>t.status==='IN_PROGRESS').length,
          pendingTransfers: list.filter((t:any)=>t.status==='CREATED' || t.status==='PENDINGPAID').length,
          assignedTransfers: list.filter((t:any)=>t.status==='ASSIGNED').length,
        } as any;
        (response as any)._metrics = totals;
        return list.map((transfer: any): TransferData => ({
          id: `${transfer?.id}` || `transfer-${Date.now()}`,
          createdAt: transfer.createdAt || transfer.created_at || transfer.created || transfer.createdDate || undefined,
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
          licensePlate: transfer.patentVehicle || transfer.licensePlate || transfer.vehicle_license_plate || 'Desconocido',
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

   const { data: drovers = [], isLoading: isLoadingDrovers } = useQuery({
    queryKey: ['admin-drover'],
    queryFn: async (): Promise<TransferData[]> => {
      try {
        console.log('[TRANSFERS] 🔄 Obteniendo drovers...');
        const response = await AdminService.getDrovers();
        // Normalizar selfie si viene anidada
        return (response as any[] || []).map((d: any) => ({
          ...d,
          photo: d?.contactInfo?.selfie || d?.selfie || d?.photo || null,
        }));
      } catch (error) {
        console.error('[TRANSFERS] ❌ Error al obtener drovers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los traslados."
        });
        return [] as any;
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

  // Derivar métricas reales basadas en la respuesta cacheada
  const metrics = React.useMemo(() => {
    const anyData: any = (transfers as any);
    const m = anyData?._metrics;
    if (m) return {
      totalTransfers: m.totalTransfers,
      completedTransfers: m.completedTransfers,
      inProgressTransfers: m.inProgressTransfers,
      pendingTransfers: m.pendingTransfers,
      assignedTransfers: m.assignedTransfers,
    };
    return undefined as any;
  }, [transfers]);

  return {
    transfers,
    metrics,
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
