
// src/components/transfer/DeliverySummaryStep.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { VehicleTransferDB } from '@/types/vehicle-transfer-db'
import GoogleMap from '@/components/maps/GoogleMap'
import { GoogleMap as MapBase, Polyline } from '@react-google-maps/api'
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
  // Preferir datos del viaje cuando vengan en el objeto
  const startAddress: any = (transfer as any)?.startAddress || null;
  const endAddress: any = (transfer as any)?.endAddress || null;
  const senderDetails = (transfer as any)?.client?.contactInfo?.fullName ? {
    fullName: (transfer as any)?.client?.contactInfo?.fullName,
    email: (transfer as any)?.client?.email,
  } : transfer.senderDetails;
  const receiverDetails = (transfer as any)?.personReceive?.fullName ? {
    fullName: (transfer as any)?.personReceive?.fullName,
    email: (transfer as any)?.personReceive?.email,
  } : transfer.receiverDetails;

  // GoogleMap espera objetos { address: string, city: string, lat: number | null, lng: number | null }
  const originCityStr = (startAddress?.address || startAddress?.city) || pickupDetails.originAddress || (
    typeof pickupDetails.originLat === 'number' && typeof pickupDetails.originLng === 'number'
      ? `${pickupDetails.originLat}, ${pickupDetails.originLng}`
      : 'Origen'
  );
  const destCityStr = (endAddress?.address || endAddress?.city) || pickupDetails.destinationAddress || (
    typeof pickupDetails.destinationLat === 'number' && typeof pickupDetails.destinationLng === 'number'
      ? `${pickupDetails.destinationLat}, ${pickupDetails.destinationLng}`
      : 'Destino'
  );
  const originAddr: LatLngCity = { 
    address: pickupDetails.originAddress || originCityStr,
    city: originCityStr,
    // Pasar null si no hay coordenadas para evitar (0,0)
    // @ts-ignore
    lat: typeof startAddress?.lat === 'number' ? startAddress.lat : (typeof pickupDetails.originLat === 'number' ? pickupDetails.originLat : null),
    // @ts-ignore
    lng: typeof startAddress?.lng === 'number' ? startAddress.lng : (typeof pickupDetails.originLng === 'number' ? pickupDetails.originLng : null),
  };
  const destAddr: LatLngCity = {
    address: destCityStr,
    city: destCityStr,
    // @ts-ignore
    lat: typeof endAddress?.lat === 'number' ? endAddress.lat : (typeof pickupDetails.destinationLat === 'number' ? pickupDetails.destinationLat : null),
    // @ts-ignore
    lng: typeof endAddress?.lng === 'number' ? endAddress.lng : (typeof pickupDetails.destinationLng === 'number' ? pickupDetails.destinationLng : null),
  };

  const capturedPolyline: string = String((transfer as any)?.routePolyline || '').trim();
  const hasCapturedRoute = capturedPolyline.length > 0;

  // Decoder ligero para polyline (Google encoding)
  const decodePolyline = (str: string): Array<{ lat: number; lng: number }> => {
    let index = 0, lat = 0, lng = 0, coordinates: Array<{ lat: number; lng: number }> = [];
    while (index < str.length) {
      let b, shift = 0, result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0; result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return coordinates;
  };

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
            <p className="text-white">{originCityStr}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Destino</p>
            <p className="text-white">{destCityStr}</p>
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
        {/* Si tenemos polyline capturado del drover, usar un mapa mínimo con Polyline */}
        {hasCapturedRoute ? (
          <MapBase
            mapContainerStyle={{ width: '100%', height: '200px' }}
            center={{ lat: (originAddr.lat ?? 0), lng: (originAddr.lng ?? 0) }}
            zoom={8}
            options={{ disableDefaultUI: true }}
            onLoad={(m) => {
              try {
                const path = decodePolyline(capturedPolyline).map(p => ({ lat: p.lat, lng: p.lng }));
                if (path.length) {
                  const bounds = new google.maps.LatLngBounds();
                  path.forEach(pt => bounds.extend(new google.maps.LatLng(pt.lat, pt.lng)));
                  m.fitBounds(bounds, 40);
                }
              } catch {}
            }}
          >
            <Polyline
              path={decodePolyline(capturedPolyline)}
              options={{ strokeColor: '#6EF7FF', strokeOpacity: 0.9, strokeWeight: 4 }}
            />
          </MapBase>
        ) : (
          <GoogleMap
            originAddress={originAddr}
            destinationAddress={destAddr}
            isAddressesSelected={true}
            onPolylineCalculated={() => {}}
          />
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
