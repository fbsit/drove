
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TransferService from '@/services/transferService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId?: string;
  currentDate?: string;
  currentTime?: string;
  onConfirm?: (newDate: Date, newTime: string, reason: string) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  transferId,
  currentDate,
  currentTime,
  onConfirm
}) => {
  const [newDate, setNewDate] = useState(currentDate || '');
  const [newTime, setNewTime] = useState(currentTime || '');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!transferId) throw new Error('Transfer ID is required');
      return await TransferService.rescheduleTransfer(transferId, {
        travelDate: newDate,
        travelTime: newTime
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
      toast({
        title: 'Traslado reprogramado',
        description: `El traslado #${transferId} ha sido reprogramado para el ${newDate} a las ${newTime}`,
      });
      onClose();
      // Reset form
      setNewDate('');
      setNewTime('');
      setReason('');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo reprogramar el traslado. Inténtalo de nuevo.',
      });
      console.error('Error reprogramando traslado:', error);
    }
  });

  const handleConfirm = () => {
    if (onConfirm) {
      // Si hay onConfirm personalizado, usarlo
      const dateObj = new Date(newDate);
      onConfirm(dateObj, newTime, reason);
      onClose();
    } else {
      // Usar el endpoint real
      rescheduleMutation.mutate();
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#22142A] rounded-2xl border-white/20 text-white max-w-[90vw] lg:max-w-[600px] py-8 px-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#6EF7FF]" />
            Reprogramar Traslado
          </DialogTitle>
          <br />
          <DialogDescription className="text-white/90 text-start">
            Selecciona la nueva fecha y hora para el traslado <br /> "{transferId && `#${transferId}`}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          <div className='flex flex-col lg:flex-row items-center gap-4'>
            <div className="w-full space-y-2">
              <Label htmlFor="new-date" className="text-white/90 flex items-center">
                Nueva fecha
              </Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={minDate}
                className="bg-white/10 relative border-white/20 text-white w-full cursor-pointer"
                onClick={(e) => {
                  const target = e.currentTarget as HTMLInputElement;
                  if (typeof target.showPicker === "function") {
                    target.showPicker();
                  }
                }}
              />

            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="new-time" className="text-white/90 flex items-center">
                {/* <Clock className="h-4 w-4" /> */}
                Nueva hora
              </Label>
              <Input
                id="new-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-white/10 relative border-white/20 text-white w-full cursor-pointer"
                onClick={(e) => {
                  const target = e.currentTarget as HTMLInputElement;
                  if (typeof target.showPicker === "function") {
                    target.showPicker();
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-white/90">
              Motivo de reprogramación
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ingresa el motivo de la reprogramación..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 flex-wrap">
          <Button
            variant="destructive"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!newDate || !newTime || rescheduleMutation.isPending}
            className="flex-1"
          >
            {rescheduleMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Reprogramando...
              </>
            ) : (
              'Confirmar reprogramación'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
