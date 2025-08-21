
import { MapLoadingOverlayProps } from './types/map-types';

const MapLoadingOverlay = ({ isVisible }: MapLoadingOverlayProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="text-white">Cargando mapa...</div>
    </div>
  );
};

export default MapLoadingOverlay;
