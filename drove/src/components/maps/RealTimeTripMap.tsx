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
  // Habilitar zoom y gestos para navegación manual
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  scrollwheel: true,
  gestureHandling: 'greedy',
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
  const [follow, setFollow] = useState<boolean>(true);
  const originRef = useRef<LatLng>(origin); // centro inicial solo para vista pre-inicio
  const lastPanAtRef = useRef<number>(0);
  const userInteractingAtRef = useRef<number>(0);
  const [routeOrigin, setRouteOrigin] = useState<LatLng>(origin);
  const lastRouteUpdateRef = useRef<number>(0);

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
      ({ coords }) => {
        const next = { lat: coords.latitude, lng: coords.longitude };
        // Filtro de movimiento mínimo: ignorar cambios < 5 m
        const last = lastPosRef.current;
        if (last && haversineMeters(last, next) < 5) return;
        setPos(next);
      },
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
        // Esperar 1.5s tras interacción manual antes de retomar auto-follow
        const interactedRecently = Date.now() - (userInteractingAtRef.current || 0) < 1500;
        if (tripStatus.toLowerCase() === 'in_progress' && mapRef.current && follow && !interactedRecently) {
          const last = lastPosRef.current;
          const derivedHeading = last ? computeBearing(last, pos) : heading;
          const targetHeadingRaw = Number.isFinite(derivedHeading) ? derivedHeading : heading;
          // Interpolar heading: 80% del anterior + 20% del nuevo
          const targetHeading = 0.8 * heading + 0.2 * targetHeadingRaw;
          setHeading(targetHeading);
          // Throttle paneos + solo si estamos lejos del centro (>100m) para evitar loop visual
          const now = Date.now();
          const center = mapRef.current.getCenter?.();
          const centerLatLng: LatLng | null = center ? { lat: center.lat(), lng: center.lng() } : null;
          const farFromCenter = centerLatLng ? (haversineMeters(centerLatLng, pos) > 100) : true;
          if (farFromCenter && now - (lastPanAtRef.current || 0) > 2000) {
            mapRef.current.panTo(pos as any);
            lastPanAtRef.current = now;
          }
          try { (mapRef.current as any).setTilt?.(60); } catch { }
          try { (mapRef.current as any).setHeading?.(targetHeading); } catch { }
        }
        lastPosRef.current = pos;
      } catch { }
    }
  }, [pos, destination, tripStatus, zoom, heading, follow]);

  // Mantener el centro del mapa estable para evitar re-montajes del mapa/direcciones
  // El seguimiento se hace con panTo dentro del efecto, no con center prop dinámico
  const containerStyle = useMemo(
    () => ({ width: '100%', height }),
    [height],
  );

  // Actualizar el origen de la ruta desde la POSICIÓN ACTUAL del drover cuando está en progreso,
  // pero con thresholds para evitar parpadeos (cada >150m y >30s)
  useEffect(() => {
    if (tripStatus.toLowerCase() !== 'in_progress' || !pos) return;
    const now = Date.now();
    const moved = haversineMeters(routeOrigin, pos);
    const longEnough = now - (lastRouteUpdateRef.current || 0) > 30000; // 30s
    // Inicialmente, fijar la ruta al drover inmediatamente
    if (!routeOrigin || (routeOrigin.lat === origin.lat && routeOrigin.lng === origin.lng)) {
      setRouteOrigin(pos);
      lastRouteUpdateRef.current = now;
      return;
    }
    if (moved > 150 && longEnough) {
      setRouteOrigin(pos);
      lastRouteUpdateRef.current = now;
    }
  }, [pos, tripStatus, routeOrigin]);

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
        center={tripStatus === 'IN_PROGRESS' && pos ? (pos as any) : (originRef.current as any)}
        options={mapOptions}
        onLoad={(map) => {
          mapRef.current = map;
          // Detectar interacción manual para pausar el auto-follow un par de segundos
          map.addListener('dragstart', () => { userInteractingAtRef.current = Date.now(); });
          map.addListener('zoom_changed', () => { userInteractingAtRef.current = Date.now(); });
          // Si ya estamos en IN_PROGRESS y tenemos posición, centrar en el drover una sola vez
          if (tripStatus.toLowerCase() === 'in_progress' && lastPosRef.current) {
            try { map.panTo(lastPosRef.current as any); } catch {}
          }
          // Fijar zoom inicial sin controlarlo externamente para que no se reinicie
          try { map.setZoom(zoom); } catch {}
        }}
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

        {/* ruta (estable para evitar recomputar en cada tick de GPS) */}
        <MapDirections
          origin={tripStatus === 'IN_PROGRESS' && pos ? routeOrigin : originRef.current}
          destination={destination}
          travelMode="DRIVING"
        />
      </GoogleMap>

      {isNear && (
        <div className="absolute top-3 right-3 bg-emerald-500/90 text-white rounded-md px-3 py-2 text-sm shadow-lg">
          🚘 Estás a &lt; 100 m del destino
        </div>
      )}

      {/* Controles de navegación */}
      <div className="absolute left-3 top-3 flex flex-col gap-2 z-50 pointer-events-auto">
        <button
          onClick={() => {
            if (mapRef.current) {
              const z = mapRef.current.getZoom() || 14;
              try { mapRef.current.setZoom(Math.min(z + 1, 21)); } catch {}
            }
          }}
          className="px-2 py-1 rounded bg-white/90 text-black text-sm shadow"
        >
          +
        </button>
        <button
          onClick={() => {
            if (mapRef.current) {
              const z = mapRef.current.getZoom() || 14;
              try { mapRef.current.setZoom(Math.max(z - 1, 3)); } catch {}
            }
          }}
          className="px-2 py-1 rounded bg-white/90 text-black text-sm shadow"
        >
          −
        </button>
        <button
          onClick={() => {
            if (pos && mapRef.current) {
              userInteractingAtRef.current = 0; // reanudar inmediatamente
              setFollow(true);
              mapRef.current.panTo(pos as any);
              try { mapRef.current.setZoom(Math.max(15, zoom)); } catch {}
            }
          }}
          className="px-2 py-1 rounded bg-white/90 text-black text-xs shadow"
        >
          Centrar
        </button>
        <button
          onClick={() => {
            setFollow((v) => {
              const next = !v;
              if (!next && mapRef.current) {
                try { (mapRef.current as any).setTilt?.(0); } catch {}
                try { (mapRef.current as any).setHeading?.(0); } catch {}
              }
              return next;
            });
          }}
          className={`px-2 py-1 rounded text-xs shadow ${follow ? 'bg-red-600 text-white' : 'bg-white/90 text-black'}`}
        >
          {follow ? 'Seguimiento: ON' : 'Seguimiento: OFF'}
        </button>
      </div>
    </div>
  );
};

export default RealTimeTripMap;
