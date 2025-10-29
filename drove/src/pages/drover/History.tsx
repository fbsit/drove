import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DroverService } from '@/services/droverService';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Clock, Package } from 'lucide-react';
import MobileDroverFooterNav from '@/components/layout/MobileDroverFooterNav';

const DroverHistorialTraslados = () => {
  const [statusFilter, setStatusFilter] = useState('todos');
  const [search, setSearch] = useState('');

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['drover-history'],
    queryFn: async () => {
      console.log('[HISTORIAL] 🔄 Obteniendo historial...');
      try {
        const transfers = await DroverService.getPastTrips(); // Aquí cambias la fuente
        console.log('[HISTORIAL] ✅ Traslados históricos:', transfers);
        return transfers;
      } catch (error) {
        console.error('[HISTORIAL] ❌ Error:', error);
        return [];
      }
    }
  });

  const filteredTransfers = transfers
    .filter((transfer) => {
      const matchesSearch =
        transfer.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        transfer.origin?.toLowerCase().includes(search.toLowerCase()) ||
        transfer.destination?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || transfer.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Historial de Traslados</h1>
          <p className="text-white/70">Revisa todos tus traslados anteriores</p>
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
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
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
                    {transfer.clientName || 'Cliente'}
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
                    <span className="text-sm">{transfer.origin || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="text-sm">Destino:</span>
                    <span className="text-sm">{transfer.destination || 'No especificado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {transfer.scheduledDate ? new Date(transfer.scheduledDate).toLocaleDateString() : 'No programado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{transfer.scheduledTime || 'Hora TBD'}</span>
                  </div>
                </div>

                <div className="text-sm text-white/60">Vehículo: {transfer.vehicleType || 'No especificado'}</div>
                <div className="text-sm text-white/60">Precio: €{transfer.price || 0}</div>

                <Button
                  size="sm"
                  className="bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] mt-2"
                >
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 text-lg">No hay traslados en el historial</p>
            <p className="text-white/50 text-sm mt-2">
              {search || statusFilter !== 'todos'
                ? 'Ajusta los filtros para encontrar traslados anteriores'
                : 'Aún no tienes traslados completados o cancelados'}
            </p>
          </div>
        )}
      </div>
      <MobileDroverFooterNav />
    </div>
  );
};

export default DroverHistorialTraslados;
