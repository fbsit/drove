
import { LatLngCity } from '@/types/lat-lng-city';

export interface MapProps {
  originAddress?: LatLngCity;
  destinationAddress?: LatLngCity;
  onOriginSelect?: (address: string, lat: number, lng: number) => void;
  onDestinationSelect?: (address: string, lat: number, lng: number) => void;
  onRouteCalculated?: (distance: string, duration: string) => void;
  isAddressesSelected?: boolean;
  onPolylineCalculated?: (polyline: string) => void;
}

export interface MapMarkerProps {
  position: google.maps.LatLng;
  isOrigin?: boolean;
}

export interface MapLoadingOverlayProps {
  isVisible: boolean;
}

// Interface para el componente AddressInput
export interface AddressValue {
  city: string;
  lat: number | null;
  lng: number | null;
}
