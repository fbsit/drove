
import React from 'react';
import { MapPin } from 'lucide-react';
import { LatLngCity } from '@/types/lat-lng-city';

interface MapFallbackProps {
  originAddress: LatLngCity | string;
  destinationAddress: LatLngCity | string;
  message?: string;
}

const MapFallback: React.FC<MapFallbackProps> = ({ 
  originAddress, 
  destinationAddress, 
  message = "Vista previa de mapa no disponible" 
}) => {
  // Extracción segura de la ciudad de la dirección
  const getCity = (address: any): string => {
    if (typeof address === 'string') {
      return address;
    } else if (address && typeof address === 'object' && address.city) {
      return address.city;
    }
    return '';
  };

  const originCity = getCity(originAddress);
  const destinationCity = getCity(destinationAddress);

  return (
    <div className="w-full h-[300px] rounded-lg bg-white/5 overflow-hidden relative flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-gradient-to-br from-[#6EF7FF]/10 to-[#22142A]/10" />
      </div>
      
      <MapPin className="h-8 w-8 text-[#6EF7FF]/50 mb-4" />
      
      <div className="text-center">
        <p className="text-white/70 mb-4">{message}</p>
        
        {(originCity || destinationCity) && (
          <div className="flex flex-col space-y-2 max-w-xs mx-auto text-sm text-white/50">
            {originCity && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="truncate">{originCity}</p>
              </div>
            )}
            
            {originCity && destinationCity && (
              <div className="border-l-2 border-dashed border-white/20 h-4 ml-1.5"></div>
            )}
            
            {destinationCity && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <p className="truncate">{destinationCity}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapFallback;
