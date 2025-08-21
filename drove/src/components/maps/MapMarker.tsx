
import { Marker } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { MapMarkerProps } from './types/map-types';

const MapMarker = ({ position, isOrigin = false }: MapMarkerProps) => {
  return (
    <Marker
      position={position}
      icon={{
        path: MapPin.toString(),
        fillColor: isOrigin ? "#6EF7FF" : "#ea384c",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#FFFFFF",
        scale: 1.5,
      }}
    />
  );
};

export default MapMarker;
