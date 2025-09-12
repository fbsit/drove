
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Calendar, Euro, Eye, Clock, CheckCircle, XCircle, AlertCircle, Play, CalendarClock, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import RescheduleNotificationModal from './RescheduleNotificationModal';
import MobileTransferCard from './MobileTransferCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { TransferStatus } from '@/services/api/types/transfers';

const TransferCard: React.FC<any> = ({ transfer }) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const isMobile = useIsMobile();

  // En móvil, usar el componente optimizado
  if (isMobile) {
    return <MobileTransferCard transfer={transfer} />;
  }

  // Desktop code - mantener existente
  const getStatusConfig = (status: string) => {
    switch (status) {
      case TransferStatus.PENDINGPAID:
        return {
          color: 'bg-orange-500/20 text-white border-orange-500/30',
          icon: <Clock className="h-3 w-3" />,
          label: 'Pendiente de pago',
          bgGradient: 'from-orange-500/10 to-yellow-500/5'
        };
      case TransferStatus.CREATED:
        return {
          color: 'bg-gray-500/20 text-white border-gray-500/30',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Creado',
          bgGradient: 'from-gray-500/10 to-slate-500/5'
        };
      case TransferStatus.ASSIGNED:
        return {
          color: 'bg-purple-500/20 text-white border-purple-500/30',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Asignado - Listo para recogida',
          bgGradient: 'from-purple-500/10 to-pink-500/5'
        };
      case TransferStatus.PICKED_UP:
        return {
          color: 'bg-indigo-500/20 text-white border-indigo-500/30',
          icon: <Play className="h-3 w-3" />,
          label: 'Recogido',
          bgGradient: 'from-indigo-500/10 to-purple-500/5'
        };
      case TransferStatus.IN_PROGRESS:
        return {
          color: 'bg-blue-500/20 text-white border-blue-500/30',
          icon: <Play className="h-3 w-3" />,
          label: 'En progreso',
          bgGradient: 'from-blue-500/10 to-indigo-500/5'
        };
      case TransferStatus.REQUEST_FINISH:
        return {
          color: 'bg-pink-500/20 text-white border-pink-500/30',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Solicita finalizar',
          bgGradient: 'from-pink-500/10 to-red-500/5'
        };
      case TransferStatus.DELIVERED:
        return {
          color: 'bg-green-500/20 text-white border-green-500/30',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Entregado',
          bgGradient: 'from-green-500/10 to-emerald-500/5'
        };
      case TransferStatus.CANCELLED:
        return {
          color: 'bg-red-500/20 text-white border-red-500/30',
          icon: <XCircle className="h-3 w-3" />,
          label: 'Cancelado',
          bgGradient: 'from-red-500/10 to-pink-500/5'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-white border-gray-500/30',
          icon: <AlertCircle className="h-3 w-3" />,
          label: status,
          bgGradient: 'from-gray-500/10 to-slate-500/5'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const statusConfig = getStatusConfig(transfer.status);

  console.log("transfer", transfer)

  return (
    <>
      <Card className={`w-full max-w-full rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/10 duration-300 group bg-white/5`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Información principal */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Car className="h-7 w-7 text-[#6EF7FF]/80 flex-shrink-0" />
                  <span className="text-white transition-colors duration-300 font-semibold">
                    {(transfer.brand || transfer.brandVehicle || '').trim()} {(transfer.model || transfer.modelVehicle || '').trim()}
                  </span>
                  <span className="text-white transition-colors duration-300 text-sm">#{transfer.licensePlate || transfer.patentVehicle}</span>
                </div>
                <div className="flex items-center gap-2 ">
                  <Badge className={`${statusConfig.color} flex items-center gap-1 text-xs font-medium`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                  {/* Badge de reprogramación */}
                  {transfer.isRescheduled && (
                    <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 flex items-center gap-1 text-xs font-medium animate-pulse">
                      <CalendarClock className="h-3 w-3" />
                      Reprogramado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-white/80 transition-colors duration-300 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="text-white/80 gray-50/90 transition-colors duration-300 truncate">{transfer?.originAddress}</span>
                      <span className="text-white/70 transition-colors duration-300 hidden sm:inline">→</span>
                      <span className="text-white/70 gray-50/90 transition-colors duration-300 truncate">{transfer?.destinationAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-white/90  transition-colors duration-300 flex-shrink-0" />
                  <span className="text-white/70 gray-50/90 transition-colors duration-300">
                    {transfer.pickupDate ? formatDate(transfer.pickupDate) : formatDate(transfer.created_at)}
                    {transfer.pickupTime && (
                      <span className="text-white/70  transition-colors duration-300"> - {transfer.pickupTime}</span>
                    )}
                    {/* Indicador de fecha actualizada */}
                    {transfer.isRescheduled && (
                      <span className="ml-2 text-amber-600 font-medium text-xs">
                        (Fecha actualizada)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Precio y acciones */}
            <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3">
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4 text-[#6EF7FF]" />
                <span className="text-[#6EF7FF] font-bold text-lg">{transfer.price}€</span>
              </div>

              <div className="flex gap-2">
                {/* Botón ver motivo de reprogramación */}
                {transfer.isRescheduled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRescheduleModal(true)}
                    className="rounded-2xl border-amber-500/30 text-amber-600 hover:bg-amber-500/10 text-xs px-3 py-1"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Ver motivo
                  </Button>
                )}

                <Link to={`/cliente/traslados/${transfer.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl hover:text-white border-[#6EF7FF]/30 text-[#6EF7FF] hover:bg-[#6EF7FF]/20 text-xs px-3 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver detalles
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Información adicional para estados específicos */}
          {(transfer.status === TransferStatus.IN_PROGRESS || transfer.status === TransferStatus.ASSIGNED) && (
            <div className="mt-4 p-3 bg-black/10 rounded-xl border border-black/10">
              <div className="flex items-center justify-center text-center text-xs">
                <span className="text-white/80 transition-colors text-center duration-300">
                  {transfer.status === TransferStatus.IN_PROGRESS ? 'Tu vehículo está en camino' : 'Un drover está asignado a tu traslado'}
                </span>
                {transfer.status === TransferStatus.IN_PROGRESS && (
                  <Link to={`/cliente/traslados/${transfer.id}`}>
                    <Button size="sm" className="bg-[#6EF7FF]/10 text-[#6EF7FF] hover:bg-[#6EF7FF]/20 text-xs py-1 px-2 h-auto rounded-xl">
                      Seguimiento en vivo
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Banner de reprogramación */}
          {transfer.isRescheduled && (
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/10 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs">
                <CalendarClock className="h-4 w-4 text-amber-600" />
                <span className="text-amber-700 font-medium">
                  Este traslado ha sido reprogramado
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRescheduleModal(true)}
                  className="ml-auto text-amber-600 hover:text-white text-xs h-auto p-1"
                >
                  Ver detalles
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de notificación de reprogramación */}
      <RescheduleNotificationModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        transfer={transfer}
      />
    </>
  );
};

export default TransferCard;
