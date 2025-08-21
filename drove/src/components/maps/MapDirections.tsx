
import { DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import { useState, useCallback } from 'react';

export interface MapDirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode: google.maps.TravelMode | string;
  onRouteReady?: (polyline: string) => void;
}

const MapDirections: React.FC<MapDirectionsProps> = ({ 
  origin, 
  destination, 
  travelMode,
  onRouteReady
}) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsRequested, setDirectionsRequested] = useState(false);

  const directionsCallback = useCallback(
    (
      result: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus
    ) => {
      if (status === 'OK' && result) {
        setDirections(result);
        setDirectionsRequested(true);
        
        // Extraer el polyline y enviarlo al callback si existe
        if (onRouteReady && result.routes[0]?.overview_polyline) {
          onRouteReady(result.routes[0].overview_polyline);
        }
      } else {
        console.error('Directions request failed with status:', status);
      }
    },
    [onRouteReady]
  );

  return (
    <>
      {!directionsRequested && (
        <DirectionsService
          options={{
            destination,
            origin,
            travelMode: travelMode as google.maps.TravelMode,
          }}
          callback={directionsCallback}
        />
      )}
      {directions && (
        <DirectionsRenderer
          options={{
            directions,
            suppressMarkers: true, // Usamos nuestros propios markers
            polylineOptions: {
              strokeColor: '#6EF7FF',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            },
          }}
        />
      )}
    </>
  );
};

export default MapDirections;
