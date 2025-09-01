import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, TrendingUp, Users, Euro,
  CreditCard, Banknote, CheckCircle, Clock,
  AlertTriangle, XCircle, Car,
} from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

import ReportsFilters from '@/components/admin/reports/ReportsFilters';
import MetricCard from '@/components/admin/reports/MetricCard';
import TransferStatusChart from '@/components/admin/reports/TransferStatusChart';
import PaymentMethodChart from '@/components/admin/reports/PaymentMethodChart';
import PaymentStatusChart from '@/components/admin/reports/PaymentStatusChart';
import TopUsersList from '@/components/admin/reports/TopUsersList';
import TopUsersListMobile from '@/components/admin/reports/TopUsersListMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReportsManagement } from '@/hooks/admin/useReportsManagement'; // 👈 hook real

const description =
  'Analiza el rendimiento de DROVE con métricas detalladas, gráficos interactivos y reportes de gestión.';

const Reports: React.FC = () => {
  /* ─────────────  filtros locales  ───────────── */
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [clientType, setClientType] = useState('all');
  const isMobile = useIsMobile();

  /* ─────────────  datos reales (hook)  ───────────── */
  const {
    reports,
    isLoading,
    generateReport,
    isGeneratingReport,
  } = useReportsManagement();

  /* ─────────────  refrescar cuando cambian filtros  ───────────── */
  useEffect(() => {
    generateReport({ type: 'general', dateRange, clientType });
  }, [dateRange, clientType]);

  /* ─────────────  presets  ───────────── */
  const handleDatePresetSelect = (preset: 'thisMonth' | 'lastMonth' | 'last3Months') => {
    const now = new Date();
    if (preset === 'thisMonth') {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    } else if (preset === 'lastMonth') {
      const last = subMonths(now, 1);
      setDateRange({ from: startOfMonth(last), to: endOfMonth(last) });
    } else {
      setDateRange({ from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) });
    }
  };

  /* ─────────────  helpers derivados  ───────────── */
  const totalTransfers = reports.transfers.toLocaleString();
  const totalRevenue = `€${reports.revenue.toLocaleString()}`;
  const activeDrivers = reports.drivers.toLocaleString();
  const growth = `${reports.monthlyGrowth.toFixed(1)}%`;

  /* Status y métodos de pago listos para gráficas */
  const chartStatusData = reports.transferStatus ?? [];
  const chartPaymentMethods = reports.paymentMethods ?? [];
  const chartPaymentStatus = reports.paymentStatus ?? [];

  /* Top lists */
  const topClients = reports.topClients ?? [];
  const topDrovers = reports.topDrovers ?? [];

  /* ─────────────  render  ───────────── */
  return (
    <div className="admin-page-container">
      <div className="mb-6">
        <h1 className="text-2xl text-white font-bold mb-1">Reportes y Análisis</h1>
        <p className="text-white/70">{description}</p>
      </div>

      <ReportsFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        clientType={clientType}
        setClientType={setClientType}
        onDatePresetSelect={handleDatePresetSelect}
        isLoading={isGeneratingReport}
      />

      {/* Métricas principales */}
      <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <MetricCard title="Traslados Totales" value={totalTransfers} icon={Calendar} iconColor="#6EF7FF" />
        <MetricCard title="Ingresos Totales" value={totalRevenue} icon={Euro} iconColor="#6EF7FF" />
        <MetricCard title="Conductores Activos" value={activeDrivers} icon={Users} iconColor="#6EF7FF" />
        <MetricCard title="Crecimiento" value={growth} icon={TrendingUp} iconColor="#6EF7FF" />
      </div>

      {/* Gráficos */}
      <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
        <TransferStatusChart data={chartStatusData} />
        <PaymentMethodChart data={chartPaymentMethods} />
      </div>

      <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
        <PaymentStatusChart data={chartPaymentStatus} />

        {isMobile ? (
          <TopUsersListMobile
            title="Mejores Clientes"
            icon={<Users className="h-4 w-4 text-[#6EF7FF]" />}
            users={topClients}
            userType="client"
            linkable
          />
        ) : (
          <TopUsersList
            title="Mejores Clientes"
            icon={<Users className="h-4 w-4 text-[#6EF7FF]" />}
            users={topClients}
            userType="client"
            linkable
          />
        )}
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
        {isMobile ? (
          <TopUsersListMobile
            title="Mejores Drovers"
            icon={<Car className="h-4 w-4 text-[#6EF7FF]" />}
            users={topDrovers}
            userType="drover"
            linkable
          />
        ) : (
          <TopUsersList
            title="Mejores Drovers"
            icon={<Car className="h-4 w-4 text-[#6EF7FF]" />}
            users={topDrovers}
            userType="drover"
            linkable
          />
        )}
        {!isMobile && <div />}
      </div>
    </div>
  );
};

export default Reports;
