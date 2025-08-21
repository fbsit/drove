
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Calendar, Euro, Eye, Clock, CheckCircle, XCircle, AlertCircle, Play, CalendarClock, Info, ArrowRight, Star } from 'lucide-react';
import { MockTransfer } from '@/types/vehicle-transfer-db';
import { Link } from 'react-router-dom';
import RescheduleNotificationModal from './RescheduleNotificationModal';
import ReviewModal from './ReviewModal';
import { useToast } from '@/hooks/use-toast';
import { TransferStatus } from '@/services/api/types/transfers';

interface MobileTransferCardProps {
  transfer: MockTransfer;
}

const MobileTransferCard: React.FC<MobileTransferCardProps> = ({ transfer }) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReview, setHasReview] = useState(!!transfer.review);
  const { toast } = useToast();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case TransferStatus.PENDINGPAID:
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Clock className="h-3 w-3" />,
          label: 'Pendiente Pago',
          bgGradient: 'from-orange-50 to-yellow-50'
        };
      case TransferStatus.CREATED:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Creado',
          bgGradient: 'from-gray-50 to-slate-50'
        };
      case TransferStatus.ASSIGNED:
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Asignado',
          bgGradient: 'from-purple-50 to-pink-50'
        };
      case TransferStatus.PICKED_UP:
        return {
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: <Play className="h-3 w-3" />,
          label: 'Recogido',
          bgGradient: 'from-indigo-50 to-purple-50'
        };
      case TransferStatus.IN_PROGRESS:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Play className="h-3 w-3" />,
          label: 'En Progreso',
          bgGradient: 'from-blue-50 to-indigo-50'
        };
      case TransferStatus.REQUEST_FINISH:
        return {
          color: 'bg-pink-100 text-pink-800 border-pink-200',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Solicita Finalizar',
          bgGradient: 'from-pink-50 to-red-50'
        };
      case TransferStatus.DELIVERED:
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Entregado',
          bgGradient: 'from-green-50 to-emerald-50'
        };
      case TransferStatus.CANCELLED:
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-3 w-3" />,
          label: 'Cancelado',
          bgGradient: 'from-red-50 to-pink-50'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="h-3 w-3" />,
          label: status,
          bgGradient: 'from-gray-50 to-slate-50'
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

  const handleReviewSubmitted = (review: { rating: number; comment: string }) => {
    setHasReview(true);
    toast({
      title: "Reseña enviada",
      description: "Tu reseña ha sido enviada correctamente.",
    });
  };

  const statusConfig = getStatusConfig(transfer.status);
  const isCompleted = transfer.status === TransferStatus.DELIVERED;
  const canLeaveReview = isCompleted && !hasReview && !transfer.review;
  const hasExistingReview = isCompleted && (hasReview || transfer.review);

  return (
    <>
      {/* Aumentamos el ancho máximo y mejoramos el layout */}
      <Card className="w-full max-w-sm bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mx-auto">
        <CardContent className="p-4">
          {/* Header con estado y fecha */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${statusConfig.color} flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
            {transfer.isRescheduled && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 text-xs font-medium animate-pulse rounded-lg">
                <CalendarClock className="h-3 w-3" />
                Reprogramado
              </Badge>
            )}
          </div>

          {/* Información del vehículo */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-[#6EF7FF]/20 rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4 text-[#22142A]" />
              </div>
              <div className="flex-1">
                <div className="text-[#22142A] font-bold text-sm leading-tight">
                  {transfer.brand} {transfer.model}
                </div>
                <div className="text-gray-600 text-xs font-mono">
                  #{transfer.licensePlate} • {transfer.year}
                </div>
              </div>
            </div>
          </div>

          {/* Ruta */}
          <div className="mb-3 bg-gray-50 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="w-0.5 h-6 bg-gray-300 my-1"></div>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">
                    Origen
                  </div>
                  <div className="text-[#22142A] text-xs font-medium leading-tight">
                    {transfer.originAddress}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">
                    Destino
                  </div>
                  <div className="text-[#22142A] text-xs font-medium leading-tight">
                    {transfer.destinationAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fecha y precio */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <div className="text-xs">
                <div className="text-[#22142A] font-medium">
                  {transfer.pickupDate ? formatDate(transfer.pickupDate) : formatDate(transfer.created_at)}
                </div>
                {transfer.pickupTime && (
                  <div className="text-gray-500 text-xs">
                    {transfer.pickupTime}
                    {transfer.isRescheduled && (
                      <span className="ml-1 text-amber-600 font-medium">(Nueva fecha)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3 text-[#22142A]" />
                <span className="text-[#22142A] font-bold text-base">{transfer.price}€</span>
              </div>
            </div>
          </div>

          {/* Mostrar rating si existe reseña */}
          {hasExistingReview && transfer.review && (
            <div className="mb-3 p-2 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-green-800 font-medium">Tu valoración:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= transfer.review!.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-green-800 ml-1 font-medium">({transfer.review.rating}/5)</span>
                </div>
              </div>
            </div>
          )}

          {/* Banner de reprogramación si aplica */}
          {transfer.isRescheduled && (
            <div className="mb-3 p-2 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3 w-3 text-amber-600" />
                  <span className="text-amber-800 font-medium">
                    Traslado reprogramado
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRescheduleModal(true)}
                  className="text-amber-600 hover:text-amber-700 text-xs h-auto p-1 rounded-lg"
                >
                  Ver detalles
                </Button>
              </div>
            </div>
          )}

          {/* Información adicional por estado */}
          {(transfer.status === TransferStatus.IN_PROGRESS || transfer.status === TransferStatus.ASSIGNED) && (
            <div className="mb-3 p-2 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-800 text-center font-medium">
                {transfer.status === TransferStatus.IN_PROGRESS ? 
                  'Tu vehículo está en camino' : 
                  'Drover asignado a tu traslado'
                }
              </div>
            </div>
          )}

          {/* Botones de acción - Layout mejorado */}
          <div className="space-y-2">
            {transfer.isRescheduled && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowRescheduleModal(true)}
                className="w-full rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 text-xs py-2.5 font-medium"
              >
                <Info className="h-3 w-3 mr-2" />
                Ver motivo de reprogramación
              </Button>
            )}

            {/* Botón de reseña para traslados completados sin reseña */}
            {canLeaveReview && (
              <Button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full bg-gradient-to-r from-[#6EF7FF] to-[#FFD700] hover:from-[#32dfff] hover:to-[#FFC700] text-[#22142A] font-medium flex items-center gap-2 rounded-xl text-xs py-2.5"
              >
                <Star className="h-3 w-3" />
                Dejar reseña
              </Button>
            )}
            
            <Link to={`/cliente/traslados/${transfer.id}`} className="block w-full">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full rounded-xl border-[#22142A] text-[#22142A] hover:bg-gray-50 text-xs py-2.5 font-medium"
              >
                <Eye className="h-3 w-3 mr-2" />
                Ver detalles del traslado
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Modal de notificación de reprogramación */}
      <RescheduleNotificationModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        transfer={transfer}
      />

      {/* Modal de reseña */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        transferId={transfer.id}
        droverName={transfer.drover?.full_name || 'Drover'}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
};

export default MobileTransferCard;
