
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarClock, ArrowRight, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileRescheduleNotificationModal from './MobileRescheduleNotificationModal';

interface RescheduleNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: {
    originalPickupDate?: string;
    originalPickupTime?: string;
    pickupDate: string;
    pickupTime: string;
    rescheduleReason?: string;
    rescheduledAt?: string;
  };
}

const RescheduleNotificationModal: React.FC<RescheduleNotificationModalProps> = ({
  isOpen,
  onClose,
  transfer
}) => {
  const isMobile = useIsMobile();

  // En móvil, usar el componente optimizado
  if (isMobile) {
    return (
      <MobileRescheduleNotificationModal
        isOpen={isOpen}
        onClose={onClose}
        transfer={transfer}
      />
    );
  }

  // Desktop version - mantener código existente
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#22142A] to-[#2A1B3D] border border-[#6EF7FF]/30 text-white">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
            <CalendarClock className="w-8 h-8 text-amber-400" />
          </div>
          <DialogTitle className="text-xl font-bold text-center font-montserrat">
            Tu traslado ha sido reprogramado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparativa de fechas */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Fecha original:</span>
              <span className="text-red-400 line-through">
                {transfer.originalPickupDate ? formatDate(transfer.originalPickupDate) : 'N/A'}
                {transfer.originalPickupTime && ` - ${transfer.originalPickupTime}`}
              </span>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-[#6EF7FF]" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Nueva fecha:</span>
              <span className="text-[#6EF7FF] font-bold">
                {formatDate(transfer.pickupDate)} - {transfer.pickupTime}
              </span>
            </div>
          </div>

          {/* Motivo de reprogramación */}
          {transfer.rescheduleReason && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-400 mb-1">Motivo:</h4>
                  <p className="text-white/80 text-sm">{transfer.rescheduleReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Fecha de reprogramación */}
          {transfer.rescheduledAt && (
            <div className="text-center text-xs text-white/50">
              Reprogramado el {formatDate(transfer.rescheduledAt)}
            </div>
          )}

          {/* Botón de confirmación */}
          <Button
            onClick={onClose}
            className="w-full bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl py-3"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleNotificationModal;
