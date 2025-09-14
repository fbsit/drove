
import { useState } from 'react';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { VehicleTransferService } from '@/services/vehicleTransferService';
import { CreateTransferRequest } from '@/services/api/types/transfers';

export const useVehicleTransferStorage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const { user } = useAuth();

  const saveTransferRequest = async (data: VehicleTransferRequest) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      console.log('Guardando solicitud de traslado:', data);
      
      // Transformar los datos al formato esperado por la API
      const transferData: CreateTransferRequest = {
        vehicleDetails: {
          type: data.vehicleDetails?.type || data.vehicleType || 'sedan',
          brand: data.vehicleDetails?.brand || '',
          model: data.vehicleDetails?.model || '',
          year: data.vehicleDetails?.year || '',
          licensePlate: data.vehicleDetails?.licensePlate || '',
          vin: data.vehicleDetails?.vin || '',
        },
        pickupDetails: {
          originAddress: {
            city: data.pickupDetails?.originAddress?.city || '',
            lat: data.pickupDetails?.originAddress?.lat ?? data.pickupAddressLat ?? 0,
            lng: data.pickupDetails?.originAddress?.lng ?? data.pickupAddressLng ?? 0,
            address: data.pickupDetails?.originAddress?.address || data.pickupAddress || '',
          },
          destinationAddress: {
            city: data.pickupDetails?.destinationAddress?.city || '',
            lat: data.pickupDetails?.destinationAddress?.lat ?? data.destinationAddressLat ?? 0,
            lng: data.pickupDetails?.destinationAddress?.lng ?? data.destinationAddressLng ?? 0,
            address: data.pickupDetails?.destinationAddress?.address || data.destinationAddress || '',
          },
          pickupTime: data.pickupDetails?.pickupTime || data.transferTime || '',
          // Enviar fecha como cadena yyyy-MM-dd (fecha pura) para que el backend la
          // guarde en columna DATE sin cambios por huso horario
          pickupDate: (() => {
            const d = (data.pickupDetails?.pickupDate || data.transferDate || new Date());
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })(),
        },
        senderDetails: {
          fullName: data.senderDetails?.fullName || data.name || '',
          dni: data.senderDetails?.dni || '',
          email: data.senderDetails?.email || data.email || '',
          phone: data.senderDetails?.phone || data.phone || '',
        },
        receiverDetails: {
          fullName: data.receiverDetails?.fullName || '',
          dni: data.receiverDetails?.dni || '',
          email: data.receiverDetails?.email || '',
          phone: data.receiverDetails?.phone || '',
        },
        transferDetails: {
          distance: data.transferDetails?.distance || 0,
          duration: data.transferDetails?.duration || 0,
          totalPrice: data.transferDetails?.totalPrice || data.price || 0,
          signature: data.transferDetails?.signature || '',
        },
        paymentMethod: data.paymentMethod || 'card',
        status: 'CREATED',
      };
      
      const apiResponse = await VehicleTransferService.createTransfer(transferData);
      setLastResponse(apiResponse);
      
      console.log('Respuesta de la API:', apiResponse);
      
      toast({
        title: "Éxito",
        description: "Tu solicitud ha sido guardada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error al guardar la solicitud:', error);
      setSaveError('Error al guardar la solicitud. Por favor, inténtalo de nuevo.');
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Error al guardar la solicitud. Por favor, inténtalo de nuevo.'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveTransferRequest,
    isSaving,
    saveError,
    lastResponse
  };
};
