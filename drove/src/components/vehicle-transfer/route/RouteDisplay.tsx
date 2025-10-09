
import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import GoogleMapComponent from '@/components/maps/GoogleMap';
import { MapPin, Clock, Navigation, Euro } from 'lucide-react';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';
import { LatLngCity } from '@/types/lat-lng-city';
import { TarifaService } from '@/services/tarifaService';
import RouteService from '@/services/routeService';

interface RouteDisplayProps {
  form: UseFormReturn<VehicleTransferFormData>;
  originAddress: LatLngCity;
  destinationAddress: LatLngCity;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({
  form,
  originAddress,
  destinationAddress
}) => {
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [recalcBusy, setRecalcBusy] = useState<boolean>(false);

  useEffect(() => {
    if (originAddress.lat && originAddress.lng && destinationAddress.lat && destinationAddress.lng) {
      calculateRoute();
    }
  }, [originAddress, destinationAddress]);

  const parseDistanceKm = (text: string): number => {
    if (!text) return 0;
    const lower = text.toLowerCase().trim();
    if (lower.includes('km')) {
      const num = lower.replace(/km.*/, '').replace(/[^0-9,.]/g, '').replace(/,/g, '.');
      const val = parseFloat(num);
      return isNaN(val) ? 0 : val;
    }
    if (lower.includes('m')) {
      const num = lower.replace(/m.*/, '').replace(/[^0-9,.]/g, '').replace(/,/g, '.');
      const meters = parseFloat(num);
      const km = isNaN(meters) ? 0 : meters / 1000;
      return km;
    }
    const fallback = parseFloat(lower.replace(/[^0-9,.]/g, '').replace(/,/g, '.'));
    return isNaN(fallback) ? 0 : fallback;
  };

  const parseDurationMinutes = (text: string): number => {
    if (!text) return 0;
    const lower = text.toLowerCase();
    // handle formats like "8 hours 23 mins", "8 h 23 min", "2h 10m"
    let hours = 0; let mins = 0;
    const hMatch = lower.match(/(\d+[\.,]?\d*)\s*h|hours?/);
    const mMatch = lower.match(/(\d+[\.,]?\d*)\s*m|mins?/);
    if (hMatch) {
      const hStr = (hMatch[0].match(/\d+[\.,]?\d*/) || ['0'])[0].replace(',', '.');
      hours = parseFloat(hStr) || 0;
    }
    if (mMatch) {
      const mStr = (mMatch[0].match(/\d+[\.,]?\d*/) || ['0'])[0].replace(',', '.');
      mins = parseFloat(mStr) || 0;
    }
    if (!hMatch && !mMatch) {
      const onlyNum = parseFloat(lower.replace(/[^0-9,.]/g, '').replace(/,/g, '.'));
      return isNaN(onlyNum) ? 0 : Math.round(onlyNum);
    }
    return Math.round(hours * 60 + mins);
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const origin = originAddress;
      const dest = destinationAddress;
      const resp = await RouteService.getDistance(
        Number(origin.lat),
        Number(origin.lng),
        Number(dest.lat),
        Number(dest.lng)
      );

      const distanceKm = parseDistanceKm(resp?.distance);
      const durationMinutes = parseDurationMinutes(resp?.duration);

      const distanceStr = `${Math.round(distanceKm)} km`;
      const durationStr = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`;

      setDistance(distanceStr);
      setDuration(durationStr);

      const calculatedPrice = await TarifaService.getPriceByDistance(distanceKm);
      setPrice(calculatedPrice);

      form.setValue('transferDetails', {
        ...form.getValues('transferDetails'),
        distance: distanceKm,
        duration: durationMinutes,
        totalPrice: calculatedPrice
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      // fallback simple: haversine approx if API fails (optional)
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!originAddress?.lat || !originAddress?.lng || !destinationAddress?.lat || !destinationAddress?.lng) return;
    setRecalcBusy(true);
    try {
      await calculateRoute();
    } finally {
      setRecalcBusy(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6EF7FF]"></div>
            <span className="ml-2 text-white">Calculando ruta...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 justify-center">
          <Navigation className="w-5 h-5 text-[#6EF7FF]" />
          <h3 className="text-white font-semibold">Información de la Ruta</h3>
        </div>

        <div className="space-y-3 text-center">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs text-green-400 font-medium">ORIGEN</p>
              <p className="text-white text-sm">{originAddress.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs text-red-400 font-medium">DESTINO</p>
              <p className="text-white text-sm">{destinationAddress.address}</p>
            </div>
          </div>
        </div>

        {distance && duration && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="w-4 h-4 text-[#6EF7FF]" />
                <span className="text-xs text-white/70">Distancia</span>
              </div>
              <p className="text-white font-semibold">{distance}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-[#6EF7FF]" />
                <span className="text-xs text-white/70">Duración</span>
              </div>
              <p className="text-white font-semibold">{duration}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Euro className="w-4 h-4 text-[#6EF7FF]" />
                <span className="text-xs text-white/70">Precio</span>
              </div>
              <p className="text-white font-semibold">{price.toFixed(2)}€</p>
            </div>
          </div>
        )}

        {/* Mapa de ruta bajo la información, sin tocar la lógica existente */}
        <div className="pt-4">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={recalcBusy}
              className="px-3 py-1.5 rounded-xl bg-[#6EF7FF] text-[#22142A] text-xs font-bold hover:opacity-90 disabled:opacity-50"
            >
              {recalcBusy ? 'Recalculando…' : 'Recalcular distancia'}
            </button>
          </div>
          <GoogleMapComponent
            originAddress={originAddress as any}
            destinationAddress={destinationAddress as any}
            isAddressesSelected={Boolean(originAddress && destinationAddress)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteDisplay;
