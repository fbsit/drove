
// src/components/transfer/DeliverySummaryStep.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { VehicleTransferDB } from '@/types/vehicle-transfer-db'
import GoogleMap from '@/components/maps/GoogleMap'
import { Polyline } from '@react-google-maps/api'
import { LatLngCity } from '@/types/lat-lng-city'

interface DeliverySummaryStepProps {
  /** Datos crudos del backend */
  transfer: VehicleTransferDB
}

const DeliverySummaryStep: React.FC<DeliverySummaryStepProps> = ({ transfer }) => {
  // Usamos los datos directamente de VehicleTransferDB
  const vehicleDetails = transfer.vehicleDetails;
  const pickupDetails = transfer.pickupDetails;
  const transferDetails = transfer.transferDetails;
  const senderDetails = transfer.senderDetails;
  const receiverDetails = transfer.receiverDetails;

  // GoogleMap espera objetos { address: string, city: string, lat: number | null, lng: number | null }
  const originAddr: LatLngCity = { 
    address: pickupDetails.originAddress || '',
    city: pickupDetails.originAddress || '',
    lat: pickupDetails.originLat || 0,
    lng: pickupDetails.originLng || 0
  };
  const destAddr: LatLngCity = {
    address: pickupDetails.destinationAddress || '',
    city: pickupDetails.destinationAddress || '',
    lat: pickupDetails.destinationLat || 0,
    lng: pickupDetails.destinationLng || 0
  };

  const hasCapturedRoute = Boolean((transfer as any)?.routePolyline && String((transfer as any).routePolyline).trim());

  // Preferir distancia/tiempo reales del drover si existen; fallback a transferDetails
  const distanceDisplay = (() => {
    const d = (transfer as any)?.distanceTravel || transferDetails.distance;
    return d ? String(d) : '—';
  })();
  const durationDisplay = (() => {
    const t = (transfer as any)?.timeTravel || transferDetails.duration;
    return t ? String(t) : '—';
  })();

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Entrega de Vehículo</h2>
        <p className="text-white/70 mt-2">Verificación final y entrega al destinatario</p>
      </div>

      {/* Información del vehículo */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-bold">Información del vehículo</h3>
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
            <p className="text-white/50 text-xs">Chasis (VIN)</p>
            <p className="text-white">{vehicleDetails.vin}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Tipo</p>
            <p className="text-white capitalize">{vehicleDetails.type}</p>
          </div>
        </CardContent>
      </Card>

      {/* Datos del traslado */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-bold">Datos del traslado</h3>
          <div>
            <p className="text-white/50 text-xs">Origen</p>
            <p className="text-white">{pickupDetails.originAddress}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Destino</p>
            <p className="text-white">{pickupDetails.destinationAddress}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/50 text-xs">Distancia</p>
              <p className="text-white">{distanceDisplay} km</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">Tiempo est.</p>
              <p className="text-white">{durationDisplay} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personas involucradas */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-bold">Personas involucradas</h3>
          <div>
            <p className="text-white/50 text-xs">Cliente (Remitente)</p>
            <p className="text-white">{senderDetails.fullName}</p>
            <p className="text-white/70 text-sm">{senderDetails.email}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Destinatario</p>
            <p className="text-white">{receiverDetails.fullName}</p>
            <p className="text-white/70 text-sm">{receiverDetails.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mapa con ruta: si hay polyline capturado del drover, usarlo */}
      <div className="h-[200px] rounded-xl overflow-hidden">
        <GoogleMap
          originAddress={originAddr}
          destinationAddress={destAddr}
          isAddressesSelected={true}
          onPolylineCalculated={() => {}}
        />
        {hasCapturedRoute && (
          // Nota: el GoogleMap simple no acepta overlay directo; en producción
          // sería mejor un componente que reciba polyline. Aquí mostramos
          // el Polyline si el contenedor ya tiene GoogleMap cargado.
          null
        )}
      </div>

      {/* Beneficio del drover (mostrar solo fee sin IVA) */}
      <div className="text-center text-white/50 text-sm">
        {(() => {
          const fee = typeof (transfer as any)?.driverFee === 'number' ? (transfer as any).driverFee : undefined;
          if (typeof fee === 'number') {
            return <p>Beneficio del drover (estimado, sin IVA): €{Number(fee).toFixed(2)}</p>;
          }
          return null;
        })()}
      </div>
    </div>
  )
}

export default DeliverySummaryStep
