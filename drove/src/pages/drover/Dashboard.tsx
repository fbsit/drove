
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Package, Route, Star, Calendar } from 'lucide-react';
import { DroverService } from '@/services/droverService';
import { useQuery } from '@tanstack/react-query';
import TravelOfferModal from '@/components/drover/TravelOfferModal';

const DroverDashboard = () => {
  const navigate = useNavigate();

  const { data: droverStats, isLoading } = useQuery({
    queryKey: ['drover-stats'],
    queryFn: async () => {
      console.log('[DROVER_DASHBOARD] 🔄 Obteniendo estadísticas...');
      try {
        const stats = await DroverService.getDroverStats();
        console.log('[DROVER_DASHBOARD] ✅ Estadísticas obtenidas:', stats);
        return stats;
      } catch (error) {
        console.error('[DROVER_DASHBOARD] ❌ Error al obtener estadísticas:', error);
        return {
          totalJobs: 0,
          completedJobs: 0,
          pendingJobs: 0,
          averageRating: 0,
          totalEarnings: 0
        };
      }
    }
  });

  const stats = droverStats || {
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    averageRating: 0,
    totalEarnings: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
            Panel de Drover
          </h1>
          <p className="text-white/70">
            Gestiona tus traslados y revisa tu rendimiento
          </p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Trabajos</CardTitle>
              <Package className="h-4 w-4 text-[#6EF7FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
              <p className="text-xs text-white/60">Histórico completo</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Completados</CardTitle>
              <Route className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completedJobs}</div>
              <p className="text-xs text-white/60">Trabajos finalizados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingJobs}</div>
              <p className="text-xs text-white/60">Por completar</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Valoración</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}/5</div>
              <p className="text-xs text-white/60">Promedio general</p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Mis Traslados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">
                Gestiona todos tus traslados asignados y pendientes
              </p>
              <Button 
                onClick={() => navigate('/drover/traslados')}
                className="w-full bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] font-bold"
              >
                Ver Traslados
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Mi Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">
                Actualiza tu información personal y documentación
              </p>
              <Button 
                onClick={() => navigate('/drover/perfil')}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">
                Revisa las valoraciones de tus clientes
              </p>
              <Button 
                onClick={() => navigate('/drover/resenas')}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                Ver Reseñas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de ofertas de viaje */}
      <TravelOfferModal />
    </div>
  );
};

export default DroverDashboard;
