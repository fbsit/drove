
import { DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import { useState, useCallback, useEffect, useRef } from 'react';

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
  const lastOriginRef = useRef<google.maps.LatLngLiteral | null>(null);
  const lastDestRef = useRef<google.maps.LatLngLiteral | null>(null);
  const lastRequestAtRef = useRef<number>(0);

  // Utilidad local: distancia Haversine en metros
  const haversineMeters = (a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) => {
    const R = 6371e3;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
    const Δφ = toRad(b.lat - a.lat);
    const Δλ = toRad(b.lng - a.lng);
    const s = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };

  // Throttle + cache: recomputar solo si pasaron >30s o movimos >150m o cambió destino
  useEffect(() => {
    const now = Date.now();
    const lastO = lastOriginRef.current;
    const lastD = lastDestRef.current;
    const destChanged = !lastD || lastD.lat !== destination.lat || lastD.lng !== destination.lng;
    const moved = lastO ? haversineMeters(lastO, origin) : Infinity;
    const timeOk = now - (lastRequestAtRef.current || 0) > 30000; // 30s
    const shouldRecalc = !directions || destChanged || moved > 150 || timeOk;
    if (shouldRecalc) {
      lastOriginRef.current = origin;
      lastDestRef.current = destination;
      lastRequestAtRef.current = now;
      setDirections(null);
      setDirectionsRequested(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

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
