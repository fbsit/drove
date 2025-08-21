
import React from 'react';
import { MapPin } from 'lucide-react';
import { Drover } from '@/types/drover';

interface DroversMapViewProps {
  drovers: Drover[];
  onVerPerfil?: (drover: Drover) => void;
}

const DroversMapView: React.FC<DroversMapViewProps> = ({ drovers, onVerPerfil }) => {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">Vista de Mapa</p>
        <p className="text-sm text-gray-500">Mostrando {drovers.length} drovers</p>
      </div>
      
      {/* Simulación de puntos en el mapa */}
      <div className="absolute inset-0 pointer-events-none">
        {drovers.slice(0, 5).map((drover, index) => (
          <div
            key={drover.id}
            className="absolute w-3 h-3 bg-[#6EF7FF] rounded-full shadow-lg animate-pulse"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DroversMapView;
