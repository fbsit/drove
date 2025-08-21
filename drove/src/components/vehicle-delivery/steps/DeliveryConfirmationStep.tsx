
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleTransferDB } from '@/types/vehicle-transfer-db';
import { useNavigate } from 'react-router-dom';

interface DeliveryConfirmationStepProps {
  transfer: VehicleTransferDB;
}

const DeliveryConfirmationStep: React.FC<DeliveryConfirmationStepProps> = ({ transfer }) => {
  const { vehicleDetails, transferDetails } = transfer;
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/drover/dashboard');
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="h-10 w-10 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white">¡Entrega completada!</h2>
        <p className="text-white/70 mt-2">
          Has finalizado exitosamente la entrega del vehículo
        </p>
      </div>
      
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-bold">Resumen del traslado</h3>
          
          <div>
            <p className="text-white/50 text-xs">Vehículo</p>
            <p className="text-white">
              {vehicleDetails?.brand} {vehicleDetails?.model} ({vehicleDetails?.year})
            </p>
          </div>
          
          <div>
            <p className="text-white/50 text-xs">Matrícula</p>
            <p className="text-white">{vehicleDetails?.licensePlate}</p>
          </div>
          
          <div>
            <p className="text-white/50 text-xs">Distancia recorrida</p>
            <p className="text-white">{transferDetails?.distance} km</p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-white text-center font-bold">
              Gracias por completar este traslado con DROVE
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        variant="default" 
        className="w-full"
        onClick={goToDashboard}
      >
        Volver al dashboard
      </Button>
    </div>
  );
};

export default DeliveryConfirmationStep;
