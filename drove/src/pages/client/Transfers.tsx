/* pages/Transfers.tsx  */
/* 100 % libre de mocks: consume el backend real y muestra los traslados del cliente */

import React, { useEffect, useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Loader, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

import DashboardLayout        from '@/components/layout/DashboardLayout';
import ClientTransferFilters  from '@/components/client/ClientTransferFilters';
import MobileTransferFilters  from '@/components/client/MobileTransferFilters';
import TransferCard           from '@/components/client/TransferCard';
import MobileFooterNav        from '@/components/layout/MobileFooterNav';

import TransferService        from '@/services/transferService';
import { ClientTransfer }     from '@/types/client-transfer';   // describe el shape real

/* -------------------------------------------------------------------------- */
/* COMPONENTE                                                                 */
/* -------------------------------------------------------------------------- */

const Transfers: React.FC = () => {
  /* ------------ contexto y helpers ------------ */
  const { user }     = useAuth();
  const isMobile     = useIsMobile();
  const clientId     = user?.id;

  /* ------------ estado ------------ */
  const [isLoading,          setIsLoading]          = useState(true);
  const [transfers,          setTransfers]          = useState<ClientTransfer[]>([]);
  const [filteredTransfers,  setFilteredTransfers]  = useState<ClientTransfer[]>([]);

  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange,    setDateRange]    = useState<DateRange>();

  /* ---------------------------------------------------------------------- */
  /* FETCH REAL DE TRASLADOS                                                */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!clientId) return;

    const loadTransfers = async () => {
      try {
        setIsLoading(true);
        const data = await TransferService.getTravelsByClient(clientId);
        console.log("data",data)
        /* Adaptamos solo los campos que TransferCard necesita */
        const formatted: ClientTransfer[] = (Array.isArray(data) ? data : []).map(
          (t) => ({
            id:                 t.id,
            status:             t.status,
            created_at:         t.createdAt,
            originAddress:      t.startAddress?.city        ?? '',
            destinationAddress: t.endAddress?.city         ?? '',
            brand:              t.brandVehicle             ?? '',
            model:              t.modelVehicle             ?? '',
            year:               t.yearVehicle              ?? '',
            licensePlate:       t.patentVehicle            ?? '',
            vin:                t.bastidor                 ?? '',
            pickupDate:         t.travelDate               ?? '',
            pickupTime:         t.travelTime               ?? '',
            distance:          +t.distanceTravel           || 0,
            duration:          +t.timeTravel               || 0,
            price:             +t.totalPrice               || 0,
          }),
        );

        setTransfers(formatted);
        setFilteredTransfers(formatted);
      } catch (err) {
        console.error('Error al cargar traslados:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar tus traslados.',
        });
        setTransfers([]);
        setFilteredTransfers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransfers();
  }, [clientId]);

  /* ---------------------------------------------------------------------- */
  /* FILTRADO LOCAL                                                         */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    let list = [...transfers];

    /* Búsqueda por texto */
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) =>
        [t.originAddress, t.destinationAddress, t.licensePlate, t.brand, t.model]
          .some((f) => f.toLowerCase().includes(q)),
      );
    }

    /* Filtro por estado */
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);

    /* Filtro por rango de fechas */
    if (dateRange?.from && dateRange.to) {
      list = list.filter((t) => {
        const d = new Date(t.created_at);
        return d >= dateRange.from! && d <= dateRange.to!;
      });
    }

    setFilteredTransfers(list);
  }, [transfers, searchTerm, statusFilter, dateRange]);

  /* ---------------------------------------------------------------------- */
  /* RENDER CARGANDO                                                        */
  /* ---------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Mis Traslados">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-[#6EF7FF]" />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER MOBILE                                                          */
  /* ---------------------------------------------------------------------- */
  if (isMobile) {
    return (
      <DashboardLayout pageTitle="Mis Traslados">
        <div className="w-full max-w-sm mx-auto min-h-screen">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white mb-1">Mis Traslados</h1>
            <p className="text-sm text-white/70">Gestiona tus traslados</p>
          </div>

          {/* Filtros */}
          <div className="mb-4">
            <MobileTransferFilters
              search={searchTerm}     setSearch={setSearchTerm}
              status={statusFilter}   setStatus={setStatusFilter}
              dateRange={dateRange}   setDateRange={setDateRange}
            />
          </div>

          {/* Lista */}
          <div className="pb-24 space-y-4">
            {filteredTransfers.length === 0 ? (
              <EmptyState hasTransfers={transfers.length > 0} />
            ) : (
              filteredTransfers.map((t) => <TransferCard key={t.id} transfer={t} />)
            )}
          </div>
        </div>

        <MobileFooterNav />
      </DashboardLayout>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER DESKTOP                                                         */
  /* ---------------------------------------------------------------------- */
  return (
    <DashboardLayout pageTitle="Mis Traslados">
      <div className="px-4 space-y-6 max-w-[846px] mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Mis Traslados</h1>
          <p className="text-white/70">Gestiona y supervisa tus traslados de vehículos</p>
        </div>

        <ClientTransferFilters
          search={searchTerm}     setSearch={setSearchTerm}
          status={statusFilter}   setStatus={setStatusFilter}
          dateRange={dateRange}   setDateRange={setDateRange}
        />

        <div className="space-y-4 pb-20">
          {filteredTransfers.length === 0 ? (
            <EmptyState hasTransfers={transfers.length > 0} />
          ) : (
            filteredTransfers.map((t) => <TransferCard key={t.id} transfer={t} />)
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

/* -------------------------------------------------------------------------- */
/* COMPONENTE DE ESTADO VACÍO                                                 */
/* -------------------------------------------------------------------------- */
const EmptyState: React.FC<{ hasTransfers: boolean }> = ({ hasTransfers }) => (
  <div className="text-center py-12">
    <div className="bg-white/5 rounded-2xl p-8 mx-auto max-w-xs">
      <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
      <h3 className="text-base font-medium text-white mb-2">
        {hasTransfers ? 'No se encontraron traslados' : 'No tienes traslados'}
      </h3>
      <p className="text-white/60 text-sm">
        {hasTransfers ? 'Intenta ajustar los filtros de búsqueda' : 'Crea tu primer traslado de vehículo'}
      </p>
    </div>
  </div>
);

export default Transfers;
