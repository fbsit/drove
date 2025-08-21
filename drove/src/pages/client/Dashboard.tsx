import React, { useMemo } from 'react';
import { Link }              from 'react-router-dom';
import { useQuery }          from '@tanstack/react-query';
import {
  Calendar, Euro, Users, TrendingUp, Car, MessageCircle, ArrowRight,
} from 'lucide-react';

import DashboardLayout           from '@/components/layout/DashboardLayout';
import TransferService           from '@/services/transferService';
import { useAuth }               from '@/contexts/AuthContext';
import { useIsMobile }           from '@/hooks/use-mobile';
import { toast }                 from '@/hooks/use-toast';

import KpiCardsCliente           from '@/components/client/KpiCardsCliente';
import ClientRecentTransferCard  from '@/components/client/ClientRecentTransferCard';
import MobileFooterNav           from '@/components/layout/MobileFooterNav';
import DroverSupportChatFab      from '@/components/layout/DroverSupportChatFab';

/* ───────────────────────────────────────────────────────────────────────────── */

export default function DashboardClienteGamificado() {
  /* -------- datos de autenticación -------- */
  const { user } = useAuth();                           // se asume user?.id, user?.full_name, user?.email
  const clientId = user?.id;
  const isMobile = useIsMobile();

  /* -------- fetch de traslados del cliente -------- */
  const {
    data: travels = [],
    isLoading,
  } = useQuery({
    queryKey: ['travels-by-client', clientId],
    queryFn:  () => TransferService.getTravelsByClient(clientId!),
    enabled:  !!clientId,
    onError: () =>
      toast({
        variant: 'destructive',
        title:   'Error',
        description: 'No se pudieron cargar tus traslados.',
      }),
  });

  const { totalTransfers, totalSpent, avgPrice, latestTravel } = useMemo(() => {
    const total   = travels.length;
    const spent   = travels.reduce((s, t) => s + (t.totalPrice ?? 0), 0);
    const avg     = total ? spent / total : 0;
    return {
      totalTransfers: total,
      totalSpent:     spent,
      avgPrice:       avg,
      latestTravel:   travels[0],
    };
  }, [travels]);

  /* -------- render -------- */
  return (
    <DashboardLayout>
      {/* Header */}
      <div className={isMobile ? 'mb-1' : 'mb-2'}>
        <h2 className={`text-white font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          {user?.full_name || 'Cliente'}
        </h2>
        <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {user?.email}
        </span>
      </div>

      {/* Traslado más reciente (si existe) */}
      {latestTravel && (
        <div className={isMobile ? 'mb-3' : 'mb-4'}>
          <ClientRecentTransferCard transfer={latestTravel} />
        </div>
      )}

      {/* KPIs */}
      <KpiCardsCliente
        totalTransfers={totalTransfers}
        avgPrice={avgPrice}
        totalSpent={totalSpent}
      />

      {/* CTA nuevo traslado */}
      <div className={isMobile ? 'my-6' : 'my-8'}>
        <Link to="/solicitar-traslado">
          <button
            className={`w-full border-2 border-[#6EF7FF] text-[#6EF7FF] rounded-2xl font-bold transition
              hover:bg-[#6EF7FF] hover:text-[#22142A]
              ${isMobile ? 'px-4 py-2.5 text-base' : 'px-6 py-3 text-lg'}`}
          >
            Solicitar nuevo traslado
          </button>
        </Link>
      </div>

      {/* Espaciado para el footer móvil */}
      <div className="h-16" />

      <MobileFooterNav />

      {/* FAB de soporte solo en escritorio */}
      {!isMobile && <DroverSupportChatFab />}
    </DashboardLayout>
  );
}
