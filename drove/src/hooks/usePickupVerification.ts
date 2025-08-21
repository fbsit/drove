
import { useState } from 'react';
import { VehicleTransferService } from '@/services/vehicleTransferService';

export const usePickupVerification = (transferId?: string) => {
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVerification = async (data: any): Promise<boolean> => {
    if (!transferId) throw new Error('Transfer ID is required');

    setIsLoading(true);
    setError(null);

    try {
      const result = await VehicleTransferService.savePickupVerification(
        transferId,
        data
      );
      console.log('Verificación guardada:', result);
      return true;
    } catch (err: any) {
      console.error('Error en submitVerification:', err);
      setError(err.message ?? 'Error al enviar la verificación');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signature,
    comments,
    isLoading,
    error,
    setSignature,
    setComments,
    submitVerification
  };
};
