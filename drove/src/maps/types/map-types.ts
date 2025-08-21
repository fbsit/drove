
import { LatLngCity } from '@/types/lat-lng-city';

export interface MapComponentProps {
  originAddress: LatLngCity;
  destinationAddress: LatLngCity;
  onOriginSelect?: (address: string, lat: number, lng: number) => void;
  onDestinationSelect?: (address: string, lat: number, lng: number) => void;
  isAddressesSelected?: boolean;
  onPolylineCalculated?: (polyline: string) => void;
}
