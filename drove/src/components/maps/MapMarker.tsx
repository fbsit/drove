
import { Marker } from '@react-google-maps/api';
import { MapMarkerProps } from './types/map-types';

const MapMarker = ({ position, isOrigin = false }: MapMarkerProps) => {
  // Para asegurar visibilidad en todos los navegadores, usamos los iconos nativos de Google.
  // - Origen: círculo cian
  // - Otros (drovers, destino): marcador por defecto
  const icon = isOrigin
    ? {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#6EF7FF',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8,
      } as google.maps.Symbol
    : undefined;

  return <Marker position={position} icon={icon} />;
};

export default MapMarker;
