/* pages/DashboardDroverPanel.tsx
   Panel del conductor – SIN mocks.                       23-jun-2025
   Usa el backend:
     • DroverService.getDashboard()  →  { stats, recentTrips }
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car, MapPin, Calendar, Star,
  TrendingUp, Clock, DollarSign,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import DroverService from '@/services/droverService';   // ⬅️ nuevos métodos
import { toast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import MobileDroverFooterNav from '@/components/layout/MobileDroverFooterNav';

const DashboardDroverPanel: React.FC = () => {
  const { user } = useAuth();           // se asume user.id
  const [tracking, setTracking] = React.useState<boolean>(() => {
    try { return localStorage.getItem('drover_tracking_active') === '1'; } catch { return false; }
  });
  const [available, setAvailable] = React.useState<boolean>(() => {
    try { return localStorage.getItem('drover_available') === '1'; } catch { return false; }
  });
  const watcherRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<number | null>(null);
  const UPDATE_MINUTES = 3; // intervalo de envío en minutos (optimizable)

  /* ------------------ fetch datos reales ------------------ */
  const { data: dashboard, isLoading } = useQuery<{
    metrics?: { assignedTrips: number; completedTrips: number; totalEarnings: number; avgPerTrip?: number; rating?: number; ratingCount?: number };
    [k: string]: any;
  }>({
    queryKey: ['drover-dashboard', user?.id],
    queryFn: () => DroverService.getDroverDashboard(),
    enabled: !!user?.id,
  });

  console.log("dashboard", dashboard)

  const stats = dashboard?.metrics ?? {
    assignedTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
  };

  // NOTE: derivedAvgPerTrip se calcula más abajo, después de declarar droverTrips y compPreviewByTripId


  console.log("valor stats", stats)
  // Viajes reales del drover
  const { data: droverTrips = [] } = useQuery({
    queryKey: ['drover-trips', user?.id],
    queryFn: async () => {
      const list = await DroverService.getMyTrips();
      return Array.isArray(list) ? list : [];
    },
    enabled: !!user?.id,
  });

  // Precalcular compensación faltante usando la misma tabla del backend (endpoint preview)
  const [compPreviewByTripId, setCompPreviewByTripId] = React.useState<Record<string, any>>({});

  const parseKmFromDistance = React.useCallback((raw: any): number => {
    if (typeof raw === 'number') return raw;
    try {
      const s = String(raw || '').replace(/[^0-9,.,-]/g, '').replace(/\s+/g, '');
      const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
      const n = parseFloat(withDot);
      return isNaN(n) ? 0 : Math.round(n);
    } catch { return 0; }
  }, []);

  React.useEffect(() => {
    const run = async () => {
      const empType = String((user as any)?.employmentType || '').toUpperCase();
      if (empType === 'CONTRACTED') return; // contratados muestran KM, no beneficio
      const id = user?.id;
      if (!id) return;
      const tasks: Array<Promise<void>> = [];
      (Array.isArray(droverTrips) ? droverTrips : []).forEach((t: any) => {
        const tripId = t.id || t._id;
        const fee = Number(t?.driverFee || 0);
        const hasMeta = typeof (t?.driverFeeMeta?.driverFeeWithVat) === 'number';
        if (fee > 0 || hasMeta || compPreviewByTripId[tripId]) return;
        const km = parseKmFromDistance(t?.distanceTravel || t?.transfer_details?.distance || t?.distance);
        if (!km || km <= 0) return;
        tasks.push((async () => {
          try {
            const preview: any = await DroverService.previewCompensation({ droverId: id, km });
            if (preview && typeof (preview as any).driverFee === 'number') {
              setCompPreviewByTripId(prev => ({ ...prev, [tripId]: { driverFee: Number((preview as any).driverFee || 0), driverFeeWithVat: Number((preview as any).driverFeeWithVat || (Number((preview as any).driverFee || 0) * 1.21)) } }));
            }
          } catch { }
        })());
      });
      if (tasks.length) await Promise.allSettled(tasks);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [droverTrips, user?.id]);

  // Fallback: si el backend no envía avgPerTrip, calcularlo desde el beneficio por viaje
  // basado en driverFee/driverFeeMeta o preview (ahora que ya existen droverTrips y compPreviewByTripId)
  const completedTripsCount = (droverTrips as any[]).filter((t: any) => {
    const s = String(t.status || t.transferStatus || t.state || '').toUpperCase();
    return s === 'DELIVERED';
  }).length;

  const derivedAvgPerTrip = (() => {
    let sum = 0;
    let cnt = 0;
    (droverTrips as any[]).forEach((t: any) => {
      const s = String(t.status || t.transferStatus || t.state || '').toUpperCase();
      if (s !== 'DELIVERED') return;
      const meta = (t as any)?.driverFeeMeta;
      const feeMeta = typeof meta?.driverFee === 'number' ? Number(meta.driverFee) : null;
      const fee = typeof t?.driverFee === 'number' ? Number(t.driverFee) : null;
      const prev = compPreviewByTripId[t.id || t._id]?.driverFee;
      const benefit = (prev != null) ? Number(prev) : (feeMeta != null ? feeMeta : (fee != null ? fee : null));
      if (typeof benefit === 'number' && isFinite(benefit)) {
        sum += benefit; cnt += 1;
      }
    });
    if (!cnt && completedTripsCount) return 0;
    return cnt ? (sum / cnt) : 0;
  })();

  // Normalizar campos para la UI
  const readAddr = (obj: any, paths: string[]): string => {
    for (const p of paths) {
      const parts = p.split('.') as string[];
      let ref: any = obj;
      let ok = true;
      for (const k of parts) {
        if (ref && k in ref) ref = ref[k]; else { ok = false; break; }
      }
      if (ok && typeof ref === 'string' && ref.trim()) return ref;
    }
    return '—';
  };

  const parseMoney = (value: any): number => {
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (value == null) return 0;
    const num = parseFloat(String(value).replace(/[^0-9,.-]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const trips = (droverTrips as any[]).map((t: any) => ({
    id: t.id || t._id,
    origin: readAddr(t, [
      'origin',
      'fromAddress',
      'startAddress.address',
      'pickup_details.originAddress',
      'pickup_details.origin.address',
      'pickup.origin.address',
      'vehicle_pickup_address'
    ]),
    destination: readAddr(t, [
      'destination',
      'toAddress',
      'endAddress.address',
      'pickup_details.destinationAddress',
      'pickup_details.destination.address',
      'dropoff.destination.address',
      'vehicle_delivery_address'
    ]),
    status: t.status || t.transferStatus || t.state || 'ASSIGNED',
    createdAt: t.createdAt || t.created_at || t.scheduledDate || t.pickup_details?.pickupDate || Date.now(),
    updatedAt: t.updatedAt || t.updated_at || null,
    totalPrice: parseMoney(t.totalPrice ?? t.price ?? t.amount ?? 0),
    driverFee: parseMoney(t.driverFee ?? (t as any)?.fee ?? (t as any)?.compensation ?? 0),
    driverFeeMeta: (t as any)?.driverFeeMeta || null,
    distanceTravel: t.distanceTravel ?? t.transfer_details?.distance ?? t.distance ?? '-',
  }));

  // Datos de mes actual para contratados: kilómetros recorridos y cuota mensual
  const employmentType = String((user as any)?.employmentType || '').toUpperCase();
  const monthISO = React.useMemo(() => new Date().toISOString().slice(0, 7), []);
  const { data: monthComp } = useQuery<any>({
    queryKey: ['drover-monthly-comp', user?.id, monthISO],
    queryFn: () => DroverService.getContractedMonthlyCompensation(String(user?.id), monthISO),
    enabled: !!user?.id && employmentType === 'CONTRACTED',
  });

  const contractedKm = Number(monthComp?.kilometers || 0);
  const contractedThreshold = Number(monthComp?.thresholdKm || 2880);
  const deliveredTripsThisMonth = React.useMemo(() => {
    const start = new Date(`${monthISO}-01T00:00:00Z`).getTime();
    const end = new Date(new Date(`${monthISO}-01T00:00:00Z`).setUTCMonth(new Date(`${monthISO}-01T00:00:00Z`).getUTCMonth() + 1)).getTime();
    const inRange = (ts: any) => {
      const n = typeof ts === 'number' ? ts : Date.parse(String(ts));
      return isFinite(n) && n >= start && n < end;
    };
    return (droverTrips as any[]).filter((t: any) => {
      const s = String(t.status || t.transferStatus || t.state || '').toUpperCase();
      const dateRef = t.updatedAt || t.updated_at || t.createdAt || t.created_at;
      return s === 'DELIVERED' && inRange(dateRef);
    }).length;
  }, [droverTrips, monthISO]);

  const avgKmPerTripThisMonth = React.useMemo(() => {
    if (deliveredTripsThisMonth > 0 && contractedKm > 0) {
      return contractedKm / deliveredTripsThisMonth;
    }
    return 0;
  }, [contractedKm, deliveredTripsThisMonth]);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const visibleTrips = trips
    .filter((t: any) => (status ? t.status === status : true))
    .filter((t: any) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return `${t.origin} ${t.destination}`.toLowerCase().includes(term);
    });

  // Rehidratar tracking al montar si estaba activo (colocado antes de cualquier return)
  React.useEffect(() => {
    const active = (() => { try { return localStorage.getItem('drover_tracking_active') === '1'; } catch { return false; } })();
    const startInterval = () => {
      if (intervalRef.current != null) return;
      intervalRef.current = window.setInterval(() => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try { await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude); } catch { }
          });
        }
      }, UPDATE_MINUTES * 60 * 1000);
    };
    if (active) {
      setTracking(true);
      // Enviar una vez al recuperar foco y al iniciar
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try { await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude); } catch { }
        });
      }
      startInterval();
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && active) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try { await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude); } catch { }
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalRef.current != null) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, []);

  /* ------------------ loading ------------------ */
  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-white">Cargando…</div>;
  }

  /* ------------------ handlers ------------------ */
  const handleAvailabilityChange = async (checked: boolean) => {
    setAvailable(checked);
    try { localStorage.setItem('drover_available', checked ? '1' : '0'); } catch { }
    try { await DroverService.setAvailability(checked); } catch { }
    if (checked && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude);
        } catch { }
      });
      // Activar tracking interval persistente
      try { localStorage.setItem('drover_tracking_active', '1'); } catch { }
      if (intervalRef.current == null) {
        intervalRef.current = window.setInterval(() => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
              try { await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude); } catch { }
            });
          }
        }, UPDATE_MINUTES * 60 * 1000);
      }
    } else {
      // Desactivar interval si no está disponible
      try { localStorage.setItem('drover_tracking_active', '0'); } catch { }
      if (intervalRef.current != null) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
    }
  };

  /* ------------------ render ------------------ */
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white w-full text-left">
          ¡Bienvenido de vuelta, @{user?.full_name?.split(' ')[0] || 'Drover'}!
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-2xl gap-2">
            <Star className="text-amber-400" size={16} />
            <span className="text-white text-lg font-bold">{(stats?.rating ?? 0).toFixed?.(1) || Number(stats?.rating || 0).toFixed(1)}</span>
            <span className="text-white/70 text-sm">({stats?.ratingCount || 0} valoraciones)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Disponibilidad:</span>
            <span className={`text-sm font-semibold ${available ? 'text-green-400' : 'text-white/60'}`}>{available ? 'Disponible' : 'Ocupado'}</span>
            <Switch checked={available} onCheckedChange={handleAvailabilityChange} className="h-6 w-11 border-2 data-[state=checked]:bg-[#6EF7FF] bg-white/20" />
          </div>
        </div>
      </div>

      {/* KPIs (solo dos contadores como en la imagen) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
        {employmentType === 'CONTRACTED' && contractedKm < contractedThreshold ? (
          <>
            <KpiCard icon={TrendingUp} label={`KM recorridos (objetivo ${contractedThreshold} km)`} value={`${Math.round(contractedKm).toLocaleString()} km`} />
            <KpiCard icon={Clock} label="KM promedio por viaje" value={`${avgKmPerTripThisMonth.toFixed(1)} km`} />
          </>
        ) : (
          <>
            <KpiCard icon={DollarSign} label="Ganancia estimada" value={`€${Number(stats?.totalEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <KpiCard icon={Star} label="Promedio por Traslado" value={`€${Number(stats?.avgPerTrip ?? derivedAvgPerTrip).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          </>
        )}
      </div>

      {/* Filtros */}
      <Card className="bg-[#251934] border border-white/10 rounded-2xl">
        <CardHeader className="p-6">
          <CardTitle className="text-white text-start">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6 pt-0">
          <input
            placeholder="Buscar por origen o destino..."
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-white placeholder:text-white/70 col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[#6EF7FF] focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-white col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[#6EF7FF] focus:border-transparent" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="ASSIGNED">Asignados</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="DELIVERED">Completados</option>
          </select>
        </CardContent>
      </Card>

      {/* Lista de viajes */}
      <Card className="bg-[#251934] border border-white/10 rounded-2xl">
        <CardHeader className="p-6">
          <CardTitle className="text-white flex items-center gap-2" style={{ fontSize: '20px' }}>
            <MapPin size={18} /> Traslados asignados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {visibleTrips.length === 0 && (
              <div className="text-white/60">No tienes traslados para mostrar.</div>
            )}
            {visibleTrips.map((t: any) => (
              <div key={t.id} className="bg-[#2A1B3D] border border-white/10 rounded-2xl p-4 gap-3 shadow flex flex-col">

                {/* Encabezado centrado con estatus a la derecha */}
                <div className="w-fit mb-2">
                  {(() => {
                    const s = String(t.status || '').toUpperCase();
                    if (s === 'DELIVERED') return <span className="text-white text-xs px-3 py-1 rounded-full bg-green-500">Completado</span>;
                    if (s === 'IN_PROGRESS') return <span className="text-black text-xs px-3 py-1 rounded-full bg-yellow-400">En progreso</span>;
                    if (s === 'REQUEST_FINISH') return <span className="text-amber-400 text-xs px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">Solicitando entrega</span>;
                    if (s === 'RESCHEDULED') return <span className="text-amber-400 text-xs px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">Reprogramado</span>;
                    if (s === 'CANCELLED') return <span className="text-white text-xs px-3 py-1 rounded-full bg-red-500">Cancelado</span>;
                    return <span className="text-white text-xs px-3 py-1 rounded-full" style={{ background: '#6366F1' }}>Asignado</span>;
                  })()}
                </div>

                <div className="relative flex justify-between mb-2">
                  <div>
                    <div className="text-white text-base md:text-lg font-bold text-left">
                      {t.origin} → {t.destination}
                    </div>
                    <div className="text-white/70 text-start text-sm">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>

                </div>
                {/* Pie: para contratados mostrar KM; para freelance mostrar ganancia */}
                <div className="flex justify-between items-center gap-4">
                  {(() => {
                    const empType = String((user as any)?.employmentType || '').toUpperCase();
                    const km = (() => { const n = parseFloat(String(t.distanceTravel || '').replace(/[^0-9,.-]/g, '').replace(',', '.')); return isNaN(n) ? 0 : Math.round(n); })();
                    // El backend ahora persiste driverFee y driverFeeMeta con la tabla actualizada (+10€)
                    // Por lo tanto, priorizamos esos valores; si no existen, dejamos 0 en lugar de recalcular con una tabla obsoleta
                    const meta: any = t.driverFeeMeta;
                    const feeMeta = typeof meta?.driverFee === 'number' ? Number(meta.driverFee) : null;
                    const fee = Number(t.driverFee || 0);
                    const preview = compPreviewByTripId[t.id || t._id];
                    const displayFee = (preview?.driverFee != null)
                      ? Number(preview.driverFee)
                      : (feeMeta != null ? feeMeta : (fee > 0 ? fee : 0));

                    if (empType === 'CONTRACTED') {
                      const distanceDisplay = typeof t.distanceTravel === 'string' && t.distanceTravel.trim()
                        ? t.distanceTravel
                        : `${km} km`;
                      return (
                        <div className="text-[#6EF7FF] text-lg font-bold flex-1 text-start">Kilómetros: {distanceDisplay}</div>
                      );
                    }

                    return (
                      <div className="text-[#6EF7FF] text-lg font-bold flex-1 text-start">Ganancia: €{Number(displayFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    );
                  })()}
                  <Link to={`/traslados/activo/${t.id}`} className="px-5 py-2 h-9 rounded-2xl bg-[#6EF7FF] text-[#22142A] text-sm hover:bg-[#22142A] hover:text-white transition-colors">Ver detalles</Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <MobileDroverFooterNav />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KpiCard helper                                                             */
/* -------------------------------------------------------------------------- */
const KpiCard: React.FC<{ icon: any; label: string; value: any }> = ({ icon: Icon, label, value }) => {
  return (
    <Card className="bg-[#2A1B3D] border border-white/10 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl" style={{ color: '#6EF7FF' }}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-white md:text-lg text-base">{label}</p>
            <p className="text-[#6EF7FF] text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDroverPanel;
