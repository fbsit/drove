import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  Euro,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

const TravelOfferModal: React.FC = () => {
  const { 
    currentOffer, 
    showOfferModal, 
    acceptOffer, 
    declineOffer, 
    closeOfferModal 
  } = useSocket();

  if (!currentOffer) return null;

  const handleAccept = () => {
    acceptOffer(currentOffer.travelId);
  };

  const handleDecline = () => {
    declineOffer(currentOffer.travelId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Dialog open={showOfferModal} onOpenChange={closeOfferModal}>
      <DialogContent className="bg-[#22142A] border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#6EF7FF]">
            <Car className="h-5 w-5" />
            Nueva Oferta de Viaje
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Cliente */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <User className="h-4 w-4 text-white/70" />
            <span className="text-white/90">{currentOffer.clientName}</span>
          </div>

          {/* Ruta */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <MapPin className="h-4 w-4 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-white/60">Origen</p>
                <p className="text-white font-medium">{currentOffer.origin}</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-white/50" />
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <MapPin className="h-4 w-4 text-red-400" />
              <div className="flex-1">
                <p className="text-sm text-white/60">Destino</p>
                <p className="text-white font-medium">{currentOffer.destination}</p>
              </div>
            </div>
          </div>

          {/* Detalles del viaje */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
              <Calendar className="h-4 w-4 text-white/70" />
              <div>
                <p className="text-xs text-white/60">Fecha</p>
                <p className="text-sm text-white font-medium">
                  {formatDate(currentOffer.scheduledDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
              <Clock className="h-4 w-4 text-white/70" />
              <div>
                <p className="text-xs text-white/60">Hora</p>
                <p className="text-sm text-white font-medium">
                  {currentOffer.scheduledTime}
                </p>
              </div>
            </div>
          </div>

          {/* Tipo de vehículo y precio */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-white/70" />
              <Badge variant="outline" className="border-white/20 text-white">
                {currentOffer.vehicleType}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[#6EF7FF] font-bold text-lg">
              <Euro className="h-4 w-4" />
              {currentOffer.price.toFixed(2)}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A]"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceptar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelOfferModal;