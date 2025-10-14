import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { TransferService } from '@/services/transferService';

const LegacyTransferRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const role = String((user as any)?.role || '').toLowerCase();
  const transferId = String(id || '');

  // If no id, fallback home
  if (!transferId) return <Navigate to="/" replace />;

  // Admin and traffic manager: decide using status if available
  if (role === 'admin' || role === 'traffic_manager') {
    const { data: trip } = useQuery({
      queryKey: ['legacy-transfer', transferId],
      queryFn: async () => {
        try { return await TransferService.getTransferById(transferId); } catch { return null; }
      },
    });

    const status = String((trip as any)?.status || '').toUpperCase();
    if (status === 'CREATED') {
      return <Navigate to={`/admin/asignar/${transferId}`} replace />;
    }
    return <Navigate to={`/traslados/activo/${transferId}`} replace />;
  }

  // Drover always to active
  if (role === 'drover') return <Navigate to={`/traslados/activo/${transferId}`} replace />;

  // Client to their trip detail
  if (role === 'client') return <Navigate to={`/cliente/traslados/${transferId}`} replace />;

  // Fallback
  return <Navigate to={`/traslados/${transferId}`} replace />;
};

export default LegacyTransferRedirect;


