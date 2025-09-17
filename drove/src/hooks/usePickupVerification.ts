
import { useEffect, useState } from 'react';
import { VehicleTransferService } from '@/services/vehicleTransferService';

export const usePickupVerification = (transferId?: string) => {
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hidratar firma y comentarios desde localStorage
  useEffect(() => {
    if (!transferId) return;
    try {
      const sig = localStorage.getItem(`pickup:${transferId}:signature`);
      const com = localStorage.getItem(`pickup:${transferId}:comments`);
      if (sig) setSignature(sig);
      if (com) setComments(com);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferId]);

  // Persistir cambios
  useEffect(() => {
    if (!transferId) return;
    try { localStorage.setItem(`pickup:${transferId}:signature`, signature || ''); } catch {}
  }, [signature, transferId]);

  useEffect(() => {
    if (!transferId) return;
    try { localStorage.setItem(`pickup:${transferId}:comments`, comments || ''); } catch {}
  }, [comments, transferId]);

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

  const clearDraft = () => {
    if (!transferId) return;
    try {
      localStorage.removeItem(`pickup:${transferId}:signature`);
      localStorage.removeItem(`pickup:${transferId}:comments`);
    } catch {}
  };

  return {
    signature,
    comments,
    isLoading,
    error,
    setSignature,
    setComments,
    submitVerification,
    clearDraft,
  };
};
