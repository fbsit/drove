
import { useState, useCallback } from 'react';

interface Location {
  address: string;
  lat: number | null;
  lng: number | null;
  city: string;
}

interface GoogleMapsState {
  origin: Location | null;
  destination: Location | null;
  distance: string;
  duration: string;
  polyline: string;
}

/**
 * Si recibimos un PlaceResult conservamos el antiguo parsing.
 * Si recibimos un string (dirección legible) usamos ese texto como ciudad.
 */
const extractInfo = (
  placeOrAddress: google.maps.places.PlaceResult | string,
): { address: string; city: string } => {
  if (typeof placeOrAddress === 'string') {
    return { address: placeOrAddress, city: placeOrAddress };
  }

  const place = placeOrAddress;
  const components = place.address_components ?? [];
  const cityComponent =
    components.find(c => c.types.includes('locality')) ||
    components.find(c => c.types.includes('administrative_area_level_2')) ||
    components.find(c => c.types.includes('administrative_area_level_1'));

  return {
    address: place.formatted_address ?? '',
    city: cityComponent?.long_name ?? place.formatted_address ?? '',
  };
};

export const useGoogleMaps = () => {
  const [state, setState] = useState<GoogleMapsState>({
    origin: null,
    destination: null,
    distance: '',
    duration: '',
    polyline: '',
  });
  const [isAddressesSelected, setIsAddressesSelected] = useState(false);

  /** Origen */
  const handleOriginSelect = useCallback(
    (
      placeOrAddress: google.maps.places.PlaceResult | string,
      lat: number,
      lng: number,
    ) => {
      const { address, city } = extractInfo(placeOrAddress);
      setState(prev => ({
        ...prev,
        origin: { address, lat, lng, city },
      }));
      setIsAddressesSelected(true);
    },
    [],
  );

  /** Destino */
  const handleDestinationSelect = useCallback(
    (
      placeOrAddress: google.maps.places.PlaceResult | string,
      lat: number,
      lng: number,
    ) => {
      const { address, city } = extractInfo(placeOrAddress);
      setState(prev => ({
        ...prev,
        destination: { address, lat, lng, city },
      }));
      setIsAddressesSelected(true);
    },
    [],
  );

  /** Distancia / duración (devuelto por Directions) */
  const updateRouteInfo = useCallback(
    (distance: string, duration: string, overview_polyline: string) => {
      setState(prev => ({
        ...prev,
        distance,
        duration,
        polyline: overview_polyline,
      }));

      const km = parseFloat(distance.replace(/[^0-9.]/g, ''));
      const min = parseInt(duration.replace(/[^0-9]/g, ''));
      if (!isNaN(km) && !isNaN(min)) {
        return { distance: km, duration: min };
      }
      return null;
    },
    [],
  );

  return {
    ...state,
    isAddressesSelected,
    handleOriginSelect,
    handleDestinationSelect,
    updateRouteInfo,
  };
};
