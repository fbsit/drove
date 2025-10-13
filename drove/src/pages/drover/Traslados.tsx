
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DroverService } from '@/services/droverService';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Clock, Phone, Mail, Package } from 'lucide-react';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DroverTraslados = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['drover-transfers'],
    queryFn: async () => {
      console.log('[DROVER_TRANSFERS] 🔄 Obteniendo traslados...',user);
      try {
        const transfers = await DroverService.getAvailableTrips(user.id);
        console.log('[DROVER_TRANSFERS] ✅ Traslados obtenidos:', transfers);
        return transfers;
      } catch (error) {
        console.error('[DROVER_TRANSFERS] ❌ Error al obtener traslados:', error);
        return [];
      }
    }
  });

  const [employmentType, setEmploymentType] = React.useState<string>('FREELANCE');
  React.useEffect(() => {
    // employmentType viene del backend en /users/me si fue expuesto; fallback a FREELANCE
    (async () => {
      try {
        const me: any = await AuthService.getCurrentUser();
        const t = (me as any)?.employmentType || (me as any)?.user?.employmentType || 'FREELANCE';
        setEmploymentType(String(t).toUpperCase());
      } catch {
        setEmploymentType('FREELANCE');
      }
    })();
  }, []);

  const filteredTransfers = transfers;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLocaleLowerCase()) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'En Progreso';
      case 'delivered': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'created': return 'Pendiente';
      case 'assigned': return 'Asignado';
      default: return 'Desconocido';
    }
  };

  const handleTransfer = (transferId: string) => {
    navigate(`/traslados/activo/${transferId}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Cargando traslados...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
            Mis Traslados
          </h1>
          <p className="text-white/70">
            Gestiona todos tus traslados asignados
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Buscar por cliente, origen o destino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de traslados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {transfer?.client?.contactInfo?.fullName || 'Cliente'}
                  </CardTitle>
                  <Badge className={`${getStatusColor(transfer.status)} text-white`}>
                    {getStatusText(transfer.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Origen:</span>
                    <span className="text-sm">{transfer.startAddress.address || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="text-sm">Destino:</span>
                    <span className="text-sm">{transfer.endAddress.address || 'No especificado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {transfer.travelDate ? new Date(transfer.travelDate).toLocaleDateString() : 'No programado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{transfer.travelTime || 'Hora TBD'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-white/60">Marca: {transfer.brandVehicle || 'No especificado'}</div>
                  <div className="text-sm text-white/60">Modelo: {transfer.modelVehicle || 'No especificado'}</div>
                  <div className="text-sm text-white/60">Tipo: {transfer.typeVehicle || 'No especificado'}</div>
                  <div className="text-sm text-white/60">
                    {employmentType === 'FREELANCE' ? (
                      (() => {
                        const meta: any = (transfer as any)?.driverFeeMeta;
                        const withVat = typeof meta?.driverFeeWithVat === 'number' ? meta.driverFeeWithVat : null;
                        const base = typeof transfer.driverFee === 'number' ? transfer.driverFee : Number(transfer.driverFee);
                        const show = typeof withVat === 'number' ? Number(withVat) : (isNaN(base) ? 0 : Number((base * 1.21).toFixed(2)));
                        return <>Compensación: €{show.toFixed(2)} IVA incl.</>;
                      })()
                    ) : (
                      <>Compensación: —</>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    size="sm"
                    onClick={() => {
                      handleTransfer(transfer.id);
                    }}
                    className="bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A]"
                  >
                    Ver Detalles
                  </Button>
                  {transfer.status === 'confirmed' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Iniciar Traslado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 text-lg">No se encontraron traslados</p>
            <p className="text-white/50 text-sm mt-2">
              {search || statusFilter !== 'todos' 
                ? 'Ajusta los filtros para encontrar traslados'
                : 'Aún no tienes traslados asignados'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroverTraslados;
