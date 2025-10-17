/* components/maps/RealTimeTripMap.tsx */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import MapDirections from './MapDirections';
import { useGoogleMapsInit } from '@/hooks/useGoogleMapsInit';
import { useToast } from '@/hooks/use-toast';

/* ---------- tipos ---------- */
interface LatLng { lat: number; lng: number }
interface Props {
  origin: LatLng;        // 🆕 punto de partida inicial
  destination: LatLng;
  tripStatus: string;        // 🆕 para saber cuándo va “in_progress”
  height?: number | string;
  zoom?: number;
}

/* ---------- utilidades ---------- */
const haversineMeters = (a: LatLng, b: LatLng) => {
  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(
    Math.sqrt(sinΔφ ** 2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ ** 2),
    Math.sqrt(1 - (sinΔφ ** 2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ ** 2)),
  );

  return R * c;
};

// Bearing in degrees from point a to b (0..360, 0 = North)
const computeBearing = (a: LatLng, b: LatLng) => {
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const λ1 = (a.lng * Math.PI) / 180;
  const λ2 = (b.lng * Math.PI) / 180;
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  const deg = (θ * 180) / Math.PI;
  return (deg + 360) % 360;
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: false,
  gestureHandling: 'cooperative',
  clickableIcons: false,
  styles: [{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  }],
};

/* ====================================================================== */
const RealTimeTripMap: React.FC<Props> = ({
  origin,
  destination,
  tripStatus,
  height = 400,
  zoom = 14,
}) => {
  const { isReady } = useGoogleMapsInit();
  const { toast } = useToast();

  const [pos, setPos] = useState<LatLng | null>(null);
  const [isNear, setNear] = useState(false);
  const watchId = useRef<number>();
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastPosRef = useRef<LatLng | null>(null);
  const [heading, setHeading] = useState<number>(0);

  /* ────────── geolocalización continua (solo en IN_PROGRESS) ────────── */
  useEffect(() => {
    // Solo activar seguimiento cuando el viaje está en progreso
    if (tripStatus !== 'IN_PROGRESS') {
      if (watchId.current) {
        try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      }
      setPos(null);
      return;
    }

    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'GPS no disponible' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPos({ lat: coords.latitude, lng: coords.longitude }),
      () => toast({ variant: 'destructive', title: 'No se pudo obtener tu posición' }),
      { enableHighAccuracy: true },
    );

    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => setPos({ lat: coords.latitude, lng: coords.longitude }),
      () => { },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );

    return () => {
      if (watchId.current) {
        try { navigator.geolocation.clearWatch(watchId.current); } catch {}
      }
    };
  }, [toast, tripStatus]);

  /* ────────── proximidad al destino ────────── */
  useEffect(() => {
    if (pos) {
      setNear(haversineMeters(pos, destination) <= 100);
      try {
        if (tripStatus.toLowerCase() === 'in_progress' && mapRef.current) {
          const last = lastPosRef.current;
          const derivedHeading = last ? computeBearing(last, pos) : heading;
          const targetHeading = Number.isFinite(derivedHeading) ? derivedHeading : heading;
          setHeading(targetHeading);
          // Follow-like camera: center, keep close zoom, tilt and orient by heading
          mapRef.current.panTo(pos as any);
          try { mapRef.current.setZoom(Math.max(15, zoom)); } catch { }
          try { (mapRef.current as any).setTilt?.(60); } catch { }
          try { (mapRef.current as any).setHeading?.(targetHeading); } catch { }
        }
        lastPosRef.current = pos;
      } catch { }
    }
  }, [pos, destination, tripStatus, zoom, heading]);

  /* ────────── origen dinámico de la ruta ────────── */
  const dynamicOrigin: LatLng =
    tripStatus.toLowerCase() === 'in_progress' && pos ? pos : origin;
  console.log("destination", destination)
  const containerStyle = useMemo(
    () => ({ width: '100%', height }),
    [height],
  );

  if (!isReady) {
    return (
      <div className="h-full bg-white/5 flex items-center justify-center">
        <p className="text-white/60 text-sm">Cargando mapa…</p>
      </div>
    );
  }

  return (
    <div className="relative h-fit w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={dynamicOrigin}
        zoom={zoom}
        options={mapOptions}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {/* posición actual */}
        {tripStatus === 'IN_PROGRESS' && pos && (
          <Marker
            position={pos}
            icon={{
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: '#6EF7FF',
              fillOpacity: 1,
              strokeColor: '#0B0F19',
              strokeWeight: 1.5,
              rotation: heading,
            } as google.maps.Symbol}
          />
        )}

        {/* destino y radio de llegada */}
        <Marker position={destination} icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png" />
        <Circle
          center={destination}
          radius={100}
          options={{
            strokeColor: '#FF0000', strokeOpacity: 0.7, strokeWeight: 1,
            fillColor: '#FF0000', fillOpacity: 0.15, clickable: false,
          }}
        />

        {/* ruta */}
        <MapDirections
          key={`${dynamicOrigin.lat}-${dynamicOrigin.lng}`} // fuerza re-render al cambiar
          origin={dynamicOrigin}
          destination={destination}
          travelMode="DRIVING"
        />
      </GoogleMap>

      {isNear && (
        <div className="absolute top-3 right-3 bg-emerald-500/90 text-white rounded-md px-3 py-2 text-sm shadow-lg">
          🚘 Estás a &lt; 100 m del destino
        </div>
      )}
    </div>
  );
};

export default RealTimeTripMap;
