
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleTransferDB } from '@/types/vehicle-transfer-db';
import GoogleMap from '@/components/maps/GoogleMap';
import { LatLngCity } from '@/types/lat-lng-city';

export interface TransferSummaryStepProps {
  transfer: VehicleTransferDB;
}

const TransferSummaryStep: React.FC<TransferSummaryStepProps> = ({ transfer }) => {
  const { vehicleDetails, pickupDetails, senderDetails, transferDetails } = transfer;

  /* ---------- Navegación externa ---------- */
  const openNavigation = () => {
    const { originLat, originLng } = pickupDetails;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    const navigationUrl = isMobile
      ? isIOS
        ? `maps://?daddr=${originLat},${originLng}`
        : `google.navigation:q=${originLat},${originLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${originLat},${originLng}`;

    window.open(navigationUrl, '_blank');
  };

  /* ---------- Objetos que espera GoogleMap ---------- */
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
      {/* -------- Cliente y vehículo -------- */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="space-y-4 p-4">
          <div>
            <h3 className="text-white font-bold text-lg">Cliente</h3>
            <p className="text-white/80">{senderDetails.fullName}</p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg">Vehículo</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-white/50 text-xs">Marca/Modelo</p>
                <p className="text-white">
                  {vehicleDetails.brand} {vehicleDetails.model}
                </p>
              </div>
              {/* Aquí podrías añadir más campos como Año, Patente, etc. */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------- Direcciones -------- */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="space-y-4 p-4">
          <h3 className="text-white font-bold text-lg">Direcciones</h3>

          <div className="flex items-start gap-2">
            <MapPin className="text-[#6EF7FF] h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/50 text-xs">Origen</p>
              <p className="text-white">{pickupDetails.originAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="text-[#6EF7FF] h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/50 text-xs">Destino</p>
              <p className="text-white">{pickupDetails.destinationAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------- Mapa -------- */}
      <div className="h-[250px] rounded-xl overflow-hidden">
        <GoogleMap
          originAddress={originAddress}
          destinationAddress={destinationAddress}
          isAddressesSelected={true}
          onPolylineCalculated={() => {}}
        />
      </div>

      {/* -------- Info ruta -------- */}
      <div className="text-center text-white/50 text-sm">
        <p>Distancia estimada: {transferDetails.distance} km</p>
        <p>Duración estimada: {transferDetails.duration} min</p>
      </div>

      {/* -------- Botón de navegación -------- */}
      <div className="text-center">
        <Button onClick={openNavigation}>
          Abrir navegación
        </Button>
      </div>
    </div>
  );
};

export default TransferSummaryStep;
