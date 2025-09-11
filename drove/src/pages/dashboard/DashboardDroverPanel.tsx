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

import { useAuth }      from '@/contexts/AuthContext';
import DroverService    from '@/services/droverService';   // ⬅️ nuevos métodos
import { toast }        from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const DashboardDroverPanel: React.FC = () => {
  const { user } = useAuth();           // se asume user.id
  const [tracking, setTracking] = React.useState<boolean>(() => {
    try { return localStorage.getItem('drover_tracking_active') === '1'; } catch { return false; }
  });
  const [available, setAvailable] = React.useState<boolean>(() => {
    try { return localStorage.getItem('drover_available') === '1'; } catch { return false; }
  });
  const watcherRef = React.useRef<number | null>(null);

  /* ------------------ fetch datos reales ------------------ */
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['drover-dashboard', user?.id],
    queryFn:   () => DroverService.getDroverDashboard(),
    enabled:   !!user?.id,
    onError: () =>
      toast({
        variant: 'destructive',
        title:   'Error',
        description: 'No se pudo cargar tu panel.',
      }),
  });

  console.log("dashboard",dashboard)

  const stats = dashboard?.metrics ?? {
  assignedTrips: 0,
  completedTrips: 0,
  totalEarnings: 0,
};


  console.log("valor stats",stats)
  // Viajes reales del drover
  const { data: droverTrips = [] } = useQuery({
    queryKey: ['drover-trips', user?.id],
    queryFn: async () => {
      const list = await DroverService.getMyTrips();
      return Array.isArray(list) ? list : [];
    },
    enabled: !!user?.id,
  });

  // Normalizar campos para la UI
  const readAddr = (obj:any, paths:string[]):string => {
    for (const p of paths) {
      const parts = p.split('.') as string[];
      let ref:any = obj;
      let ok = true;
      for (const k of parts) {
        if (ref && k in ref) ref = ref[k]; else { ok = false; break; }
      }
      if (ok && typeof ref === 'string' && ref.trim()) return ref;
    }
    return '—';
  };

  const trips = (droverTrips as any[]).map((t:any) => ({
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
    totalPrice: t.totalPrice ?? t.price ?? t.amount ?? 0,
  }));
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const visibleTrips = trips
    .filter((t:any) => (status ? t.status === status : true))
    .filter((t:any) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return `${t.origin} ${t.destination}`.toLowerCase().includes(term);
    });

  // Rehidratar tracking al montar si estaba activo (colocado antes de cualquier return)
  React.useEffect(() => {
    const active = (() => { try { return localStorage.getItem('drover_tracking_active') === '1'; } catch { return false; }})();
    if (active && watcherRef.current == null && 'geolocation' in navigator) {
      watcherRef.current = navigator.geolocation.watchPosition(async (pos) => {
        try { await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude); } catch {}
      }, () => {}, { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 });
      setTracking(true);
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && active) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try { await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude); } catch {}
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  /* ------------------ loading ------------------ */
  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-white">Cargando…</div>;
  }

  /* ------------------ handlers ------------------ */
  const handleAvailabilityChange = async (checked: boolean) => {
    setAvailable(checked);
    try { localStorage.setItem('drover_available', checked ? '1' : '0'); } catch {}
    if (checked && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await DroverService.updateCurrentPosition(pos.coords.latitude, pos.coords.longitude);
        } catch {}
      });
    }
  };

  /* ------------------ render ------------------ */
  return (
    <div className="max-w-[960px] mx-auto pt-16 p-4 md:p-6 pb-20 px-2 space-y-7">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard icon={DollarSign} label="Ganancia estimada" value={`€${(stats?.totalEarnings ?? 0).toLocaleString()}`} />
        <KpiCard icon={Star}       label="Promedio por Traslado" value={`€${(stats?.avgPerTrip ?? 0).toLocaleString(undefined,{minimumFractionDigits:2})}`} />
      </div>

      {/* Filtros */}
      <Card className="bg-[#251934] border border-white/10 rounded-2xl">
        <CardHeader className="p-6">
          <CardTitle className="text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6 pt-0">
          <input
            placeholder="Buscar por origen o destino..."
            className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-white placeholder:text-white/70 col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[#6EF7FF] focus:border-transparent"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
          <select className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-white col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[#6EF7FF] focus:border-transparent" value={status} onChange={(e)=>setStatus(e.target.value)}>
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
          <CardTitle className="text-white flex items-center gap-2" style={{fontSize: '20px'}}>
            <MapPin size={18}/> Traslados asignados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {visibleTrips.length === 0 && (
              <div className="text-white/60">No tienes traslados para mostrar.</div>
            )}
            {visibleTrips.map((t:any) => (
              <div key={t.id} className="bg-[#2A1B3D] border border-white/10 rounded-2xl p-4 gap-3 shadow">
                {/* Encabezado centrado con estatus a la derecha */}
                <div className="relative flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="text-white text-base md:text-lg font-bold">
                      {t.origin} → {t.destination}
                    </div>
                    <div className="text-white/70 text-sm">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="absolute right-0 top-0">
                    {(() => {
                      const s = String(t.status || '').toUpperCase();
                      if (s === 'DELIVERED') return <span className="text-white text-xs px-3 py-1 rounded-full bg-green-500">Completado</span>;
                      if (s === 'IN_PROGRESS') return <span className="text-black text-xs px-3 py-1 rounded-full bg-yellow-400">En progreso</span>;
                      if (s === 'REQUEST_FINISH') return <span className="text-amber-400 text-xs px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">Solicitando entrega</span>;
                      if (s === 'RESCHEDULED') return <span className="text-amber-400 text-xs px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">Reprogramado</span>;
                      if (s === 'CANCELLED') return <span className="text-white text-xs px-3 py-1 rounded-full bg-red-500">Cancelado</span>;
                      return <span className="text-white text-xs px-3 py-1 rounded-full" style={{background:'#6366F1'}}>Asignado</span>;
                    })()}
                  </div>
                </div>
                {/* Pie con ganancia a la izquierda y botón a la derecha */}
                <div className="flex items-center justify-between">
                  <div className="text-[#6EF7FF] text-lg font-bold">Ganancia: €{(+t.totalPrice).toLocaleString()}</div>
                  <Link to={`/traslados/activo/${t.id}`} className="px-5 py-2 h-9 rounded-2xl bg-[#6EF7FF] text-[#22142A] text-sm hover:bg-[#22142A] hover:text-white transition-colors">Ver detalles</Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KpiCard helper                                                             */
/* -------------------------------------------------------------------------- */
const KpiCard: React.FC<{icon:any; label:string; value:any}> = ({ icon:Icon, label, value }) => {
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
