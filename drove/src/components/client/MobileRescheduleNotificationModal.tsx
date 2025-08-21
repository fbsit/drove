
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarClock, ArrowDown, AlertCircle } from 'lucide-react';

interface MobileRescheduleNotificationModalProps {
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

const MobileRescheduleNotificationModal: React.FC<MobileRescheduleNotificationModalProps> = ({
  isOpen,
  onClose,
  transfer
}) => {
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-gradient-to-br from-[#22142A] to-[#2A1B3D] border border-[#6EF7FF]/30 text-white mx-4">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
            <CalendarClock className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="text-lg font-bold text-center">
            Traslado reprogramado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comparativa de fechas - Layout vertical para móvil */}
          <div className="bg-white/5 rounded-xl p-3 space-y-3">
            <div className="text-center">
              <div className="text-xs text-white/60 mb-1">Fecha original:</div>
              <div className="text-red-400 line-through text-sm">
                {transfer.originalPickupDate ? formatDateShort(transfer.originalPickupDate) : 'N/A'}
                {transfer.originalPickupTime && (
                  <div className="text-xs mt-0.5">{transfer.originalPickupTime}</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-[#6EF7FF]" />
            </div>
            
            <div className="text-center">
              <div className="text-xs text-white/60 mb-1">Nueva fecha:</div>
              <div className="text-[#6EF7FF] font-bold text-sm">
                {formatDateShort(transfer.pickupDate)}
                <div className="text-xs mt-0.5">{transfer.pickupTime}</div>
              </div>
            </div>
          </div>

          {/* Motivo de reprogramación */}
          {transfer.rescheduleReason && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-400 mb-1 text-xs">Motivo:</h4>
                  <p className="text-white/80 text-xs leading-relaxed">{transfer.rescheduleReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Fecha de reprogramación */}
          {transfer.rescheduledAt && (
            <div className="text-center text-xs text-white/50">
              Reprogramado el {formatDateShort(transfer.rescheduledAt)}
            </div>
          )}

          {/* Botón de confirmación */}
          <Button
            onClick={onClose}
            className="w-full bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-xl py-2.5 text-sm"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileRescheduleNotificationModal;
