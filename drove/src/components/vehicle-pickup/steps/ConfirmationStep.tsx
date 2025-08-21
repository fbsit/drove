
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleTransferDB } from '@/types/vehicle-transfer-db';
import GoogleMap from '@/components/maps/GoogleMap';
import { LatLngCity } from '@/types/lat-lng-city';

interface ConfirmationStepProps {
  transfer: VehicleTransferDB;
  onNavigate: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ transfer, onNavigate }) => {
  const { vehicleDetails, pickupDetails, transferDetails } = transfer;

  // Crear objetos LatLngCity completos para el mapa
  const originAddress: LatLngCity = { 
    address: pickupDetails.originAddress,
    city: pickupDetails.originAddress, 
    lat: pickupDetails.originLat || 0,
    lng: pickupDetails.originLng || 0
  };
  
  const destinationAddress: LatLngCity = { 
    address: pickupDetails.destinationAddress,
    city: pickupDetails.destinationAddress, 
    lat: pickupDetails.destinationLat || 0,
    lng: pickupDetails.destinationLng || 0
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="h-10 w-10 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white">¡Buen viaje!</h2>
        <p className="text-white/70 mt-2">
          Esperamos que llegues bien a destino 🚗
        </p>
      </div>
      
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-bold">Resumen del traslado</h3>
          
          <div>
            <p className="text-white/50 text-xs">Vehículo</p>
            <p className="text-white">
              {vehicleDetails.brand} {vehicleDetails.model} ({vehicleDetails.year})
            </p>
          </div>
          
          <div>
            <p className="text-white/50 text-xs">Matrícula</p>
            <p className="text-white">{vehicleDetails.licensePlate}</p>
          </div>
          
          <div>
            <p className="text-white/50 text-xs">Destino</p>
            <p className="text-white">{destinationAddress.city}</p>
          </div>
          
          <div>
            <p className="text-white/50 text-xs">Distancia</p>
            <p className="text-white">{transferDetails.distance} km</p>
          </div>
          
          <div>
            <p className="text-white/50 text-xs">Tiempo est.</p>
            <p className="text-white">{transferDetails.duration} min</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="h-[200px] rounded-xl overflow-hidden">
        <GoogleMap 
          originAddress={originAddress}
          destinationAddress={destinationAddress}
          isAddressesSelected={true}
          onPolylineCalculated={() => {}}
        />
      </div>
      
      <Button 
        variant="default" 
        className="w-full"
        onClick={onNavigate}
      >
        <Navigation className="mr-2 h-5 w-5" />
        Abrir navegación
      </Button>
    </div>
  );
};

export default ConfirmationStep;
