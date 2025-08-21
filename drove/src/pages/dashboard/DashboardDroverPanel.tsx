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
import { Button } from '@/components/ui/button';

const DashboardDroverPanel: React.FC = () => {
  const { user } = useAuth();           // se asume user.id

  /* ------------------ fetch datos reales ------------------ */
  const {
    data: dashboard,
    isLoading,
  } = useQuery({
    queryKey: ['drover-dashboard', user?.id],
    queryFn:   () => DroverService.getDroverDashboard(user!.id),
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
  const recentTrips  = dashboard?.recentTrips ?? [];

  /* ------------------ loading ------------------ */
  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-white">Cargando…</div>;
  }

  /* ------------------ render ------------------ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            ¡Bienvenido de vuelta, {user?.full_name?.split(' ')[0] || 'Drover'}!
          </h1>
          <p className="text-white/70 mt-1">Tu panel de control personalizado</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-2xl">
            <Star className="text-yellow-500" size={16} />
            <span className="text-white font-semibold">{stats?.rating?.toFixed(1)}</span>
            <span className="text-white/60 text-sm">({stats?.ratingCount} reseñas)</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Car}        color="[#6EF7FF]" label="Viajes Asignados"    value={stats?.assignedTrips}/>
        <KpiCard icon={TrendingUp} color="green"     label="Completados"       value={stats?.completedTrips}/>
        <KpiCard icon={DollarSign} color="blue"      label="Ganancias (€)"     value={stats?.totalEarnings?.toLocaleString()}/>
        <KpiCard icon={Star}       color="yellow"    label="Calificación"      value={stats?.rating?.toFixed(1)}/>
      </div>

      {/* Viajes recientes y acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recientes */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock size={20}/> Viajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTrips.length === 0 && (
              <p className="text-white/60">No hay viajes recientes.</p>
            )}
            {recentTrips.map((t: any) => (
              <div key={t.id} className="bg-white/5 rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#6EF7FF]" />
                    <span className="text-white text-sm">{t.origin} → {t.destination}</span>
                  </div>
                  <span className={`rounded-full text-xs font-semibold px-2 py-1 ${
                    t.status === 'DELIVERED'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {t.status === 'DELIVERED' ? 'Completado' : 'Activo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-white font-semibold">
                    €{(+t.totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-[#6EF7FF] text-[#22142A] rounded-2xl h-12">
              <Link to="/drover/viajes-disponibles">
                <Car size={18} className="mr-2"/> Ver Viajes Disponibles
              </Link>
            </Button>

            <Button variant="outline" className="w-full rounded-2xl h-12">
              <Calendar size={18} className="mr-2"/> Programar Disponibilidad
            </Button>

            <Button variant="outline" className="w-full rounded-2xl h-12">
              <Star size={18} className="mr-2"/> Historial Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KpiCard helper                                                             */
/* -------------------------------------------------------------------------- */
const KpiCard: React.FC<{icon: any; color: string; label: string; value: any}> = ({
  icon: Icon, color, label, value,
}) => (
  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center gap-3">
        <div className={`bg-${color}-500/20 p-3 rounded-2xl`}>
          <Icon className={`text-${color}-500`} size={24}/>
        </div>
        <div>
          <p className="text-white/60 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DashboardDroverPanel;
