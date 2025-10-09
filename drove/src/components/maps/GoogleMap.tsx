
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap as ReactGoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMapsInit } from '@/hooks/useGoogleMapsInit';
import { useGoogleMapsRouting } from '@/hooks/useGoogleMapsRouting';
import { MapProps } from './types/map-types';
import MapMarker from './MapMarker';
import MapDirections from './MapDirections';
import MapLoadingOverlay from './MapLoadingOverlay';
import MapFallback from './MapFallback';
import { LatLngCity } from '@/types/lat-lng-city';

const defaultCenter = {
  lat: 40.4167754,
  lng: -3.7037902
};

// Opciones de mapa (estándar, sin estilos oscuros)
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  scrollwheel: true,
  gestureHandling: 'greedy' as const,
  clickableIcons: true,
  streetViewControl: false,
  mapTypeControl: true,
  mapTypeId: 'roadmap' as const,
  backgroundColor: '#ffffff',
  minZoom: 3,
  maxZoom: 18,
};

// Extendemos MapDirectionsProps para incluir onRouteReady
interface ExtendedMapDirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode: google.maps.TravelMode | string;
  onRouteReady?: (polyline: string) => void;
}

type DroverMarker = { id: string; lat: number; lng: number; name?: string };

const GoogleMapComponent = ({ 
  originAddress, 
  destinationAddress,
  onOriginSelect,
  onDestinationSelect,
  onRouteCalculated,
  isAddressesSelected = false,
  onPolylineCalculated,
  droverMarkers
}: MapProps) => {
  const { isReady, error, isApiBlocked } = useGoogleMapsInit();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isMapInitialized = useRef(false);
  const mapFitBoundsCalled = useRef(false);
  
  // Memorizar direcciones para evitar re-renders
  const addresses = useMemo(() => ({
    origin: originAddress?.city,
    destination: destinationAddress?.city
  }), [originAddress, destinationAddress]);
  
  const {
    originMarker,
    destinationMarker,
    directionsResult,
    isLoading,
    routeInfo
  } = useGoogleMapsRouting(
    map,
    addresses.origin,
    addresses.destination,
    isAddressesSelected,
    onRouteCalculated,
    { lat: originAddress?.lat ?? null, lng: originAddress?.lng ?? null },
    { lat: destinationAddress?.lat ?? null, lng: destinationAddress?.lng ?? null },
  );

  const shouldShowMap = isReady && isAddressesSelected && addresses.origin && addresses.destination && !isApiBlocked;
  
  // Memorizar marcadores para evitar re-renders
  const markers = useMemo(() => {
    if (!originMarker || !destinationMarker) return null;
    
    return {
      origin: { lat: originMarker.lat(), lng: originMarker.lng() },
      destination: { lat: destinationMarker.lat(), lng: destinationMarker.lng() }
    };
  }, [originMarker, destinationMarker]);

  // Optimizar la carga del mapa para que ocurra solo una vez
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Mapa cargado - optimizado');
    mapRef.current = map;
    setMap(map);
    isMapInitialized.current = true;
    
    // Reducir detalle del mapa para mejorar rendimiento
    map.setOptions({
      maxZoom: 15
    });
  }, []);

  const onUnmount = useCallback(() => {
    console.log('Mapa desmontado');
    mapRef.current = null;
    setMap(null);
    isMapInitialized.current = false;
    mapFitBoundsCalled.current = false;
  }, []);
  
  // Ajustar el mapa para mostrar todos los marcadores
  useEffect(() => {
    if (!mapRef.current || !markers || !markers.origin || !markers.destination || mapFitBoundsCalled.current) return;
    
    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(markers.origin.lat, markers.origin.lng));
      bounds.extend(new google.maps.LatLng(markers.destination.lat, markers.destination.lng));
      
      // Corregido: Usar objeto con propiedades correctas para padding
      mapRef.current.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      });
      
      mapFitBoundsCalled.current = true;
    } catch (error) {
      console.error('Error al ajustar el mapa:', error);
    }
  }, [markers]);

  // Usar useEffect para sincronizar datos con el mapa en lugar de recrear componentes
  useEffect(() => {
    if (originMarker && onOriginSelect) {
      console.log('Notificando selección de origen:', addresses.origin);
      onOriginSelect(addresses.origin || '', originMarker.lat(), originMarker.lng());
    }
  }, [originMarker, addresses.origin, onOriginSelect]);

  useEffect(() => {
    if (destinationMarker && onDestinationSelect) {
      console.log('Notificando selección de destino:', addresses);
      onDestinationSelect(addresses.destination || '', destinationMarker.lat(), destinationMarker.lng());
    }
  }, [destinationMarker, addresses.destination, onDestinationSelect]);

  // Si el mapa no está listo o hay un error con la API, mostrar un estado alternativo
  if (!isReady || isApiBlocked) {
    return (
      <div className="w-full space-y-4">
        <MapFallback 
          originAddress={originAddress} 
          destinationAddress={destinationAddress}
          message={isApiBlocked ? "Servicio de mapas no disponible" : "Cargando mapa..."}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <MapFallback 
          originAddress={originAddress} 
          destinationAddress={destinationAddress}
          message="Error al cargar el mapa"
        />
      </div>
    );
  }

  if (!shouldShowMap) {
    return (
      <div className="w-full space-y-4">
        <div className="w-full h-[300px] rounded-lg bg-white/5 flex items-center justify-center">
          <p className="text-white/50">Ingrese direcciones para ver el mapa</p>
        </div>
      </div>
    );
  }

  // Función para manejar el callback de la ruta
  const handleRouteReady = (polyline: string) => {
    if (onPolylineCalculated) {
      onPolylineCalculated(polyline);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full h-[300px] rounded-lg overflow-hidden relative" ref={mapContainerRef}>
        <ReactGoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {markers?.origin && <MapMarker position={new google.maps.LatLng(markers.origin.lat, markers.origin.lng)} isOrigin />}
          {markers?.destination && (
            // Destino con el mismo círculo azul para alta visibilidad
            <MapMarker position={new google.maps.LatLng(markers.destination.lat, markers.destination.lng)} isOrigin />
          )}
          {/* Marcadores de drovers disponibles cerca del origen */}
          {Array.isArray((droverMarkers as any)) && (droverMarkers as any).map((d: DroverMarker & { address?: string }) => {
            if (typeof d.lat !== 'number' || typeof d.lng !== 'number') return null;
            try {
              console.log('[MAP] Drover marker:', { id: d.id, name: d?.name, address: (d as any)?.address, lat: d.lat, lng: d.lng });
            } catch {}
            const pos = { lat: Number(d.lat), lng: Number(d.lng) } as google.maps.LatLngLiteral;
            return (
              <Marker
                key={d.id}
                position={pos}
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                zIndex={999}
              />
            );
          })}
          
          {markers?.origin && markers?.destination && !isLoading && (
            <MapDirections 
              origin={markers.origin}
              destination={markers.destination}
              travelMode="DRIVING"
              // Pasamos la función como prop
              onRouteReady={handleRouteReady}
            />
          )}
        </ReactGoogleMap>
        <MapLoadingOverlay isVisible={isLoading} />
      </div>
    </div>
  );
};

export default GoogleMapComponent;
