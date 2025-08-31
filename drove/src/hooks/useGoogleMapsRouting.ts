// src/hooks/useGoogleMapsRouting.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleMapsInit } from './useGoogleMapsInit';

interface RouteInfo {
  distance: string;
  duration: string;
}

interface CachedGeocode {
  address: string;
  location: google.maps.LatLng;
  timestamp: number;
}

// Cache para evitar geocodificaciones repetidas
const geocodeCache = new Map<string, CachedGeocode>();
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 h

export function useGoogleMapsRouting(
  map: google.maps.Map | null,
  originAddress?: string,
  destinationAddress?: string,
  isAddressesSelected = false,
  onRouteCalculated?: (distance: string, duration: string) => void,
  originCoord?: { lat: number | null; lng: number | null },
  destinationCoord?: { lat: number | null; lng: number | null },
) {
  const { isReady, isApiBlocked } = useGoogleMapsInit();
  const [originMarker, setOriginMarker] = useState<google.maps.LatLng | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<google.maps.LatLng | null>(null);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const geocoderRef = useRef<google.maps.Geocoder>();
  // Inicializar Geocoder una sola vez
  useEffect(() => {
    if (isReady && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isReady]);

  const geocodeAddress = useCallback(async (
    address: string
  ): Promise<google.maps.LatLng | null> => {
    if (!geocoderRef.current || isApiBlocked) return null;

    const now = Date.now();
    const cached = geocodeCache.get(address);
    if (cached && now - cached.timestamp < CACHE_EXPIRY) {
      return cached.location;
    }

    return new Promise(resolve => {
      geocoderRef.current!.geocode({ address, region: 'ES' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          geocodeCache.set(address, { address, location: loc, timestamp: Date.now() });
          resolve(loc);
        } else {
          console.error('Geocode failed', status);
          resolve(null);
        }
      });
    });
  }, [isApiBlocked]);

  // — Fijar ORIGEN por coordenadas (si hay), si no geocodificar dirección —
  useEffect(() => {
    if (!map || !isReady || isApiBlocked || !isAddressesSelected) return;
    if (originCoord && originCoord.lat != null && originCoord.lng != null) {
      const loc = new google.maps.LatLng(originCoord.lat, originCoord.lng);
      setOriginMarker(loc);
      map.panTo(loc);
      return;
    }
    if (originAddress) {
      geocodeAddress(originAddress).then(loc => {
        if (loc) {
          setOriginMarker(loc);
          map.panTo(loc);
        }
      });
    }
  }, [map, originAddress, originCoord?.lat, originCoord?.lng, isAddressesSelected, isReady, isApiBlocked, geocodeAddress]);

  // — Fijar DESTINO por coordenadas (si hay), si no geocodificar —
  useEffect(() => {
    if (!map || !isReady || isApiBlocked || !isAddressesSelected) return;
    if (destinationCoord && destinationCoord.lat != null && destinationCoord.lng != null) {
      const loc = new google.maps.LatLng(destinationCoord.lat, destinationCoord.lng);
      setDestinationMarker(loc);
      return;
    }
    if (destinationAddress) {
      geocodeAddress(destinationAddress).then(loc => {
        if (loc) {
          setDestinationMarker(loc);
        }
      });
    }
  }, [map, destinationAddress, destinationCoord?.lat, destinationCoord?.lng, isAddressesSelected, isReady, isApiBlocked, geocodeAddress]);

  // — Calcular ruta cuando ambos marcadores estén listos —
  useEffect(() => {
    if (
      map &&
      isReady &&
      !isApiBlocked &&
      originMarker &&
      destinationMarker &&
      window.google?.maps
    ) {
      setIsLoading(true);

      const service = new google.maps.DirectionsService();
      service.route({
        origin: originMarker,
        destination: destinationMarker,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        setIsLoading(false);
        if (status === 'OK' && result) {
          setDirectionsResult(result);

          const leg = result.routes[0]?.legs[0];
          const distance = leg?.distance?.text || '';
          const duration = leg?.duration?.text || '';

          setRouteInfo({ distance, duration });
          if (onRouteCalculated) onRouteCalculated(distance, duration);
        } else {
          console.error('Directions request failed', status);
        }
      });
    }
  }, [map, isReady, isApiBlocked, originMarker, destinationMarker, onRouteCalculated]);

  return {
    originMarker,
    destinationMarker,
    directionsResult,
    isLoading,
    routeInfo,
  };
}
