export function installGoogleMapsMock() {
  // Minimal mock of Google Maps APIs used by components
  (globalThis as any).google = {
    maps: {
      Map: class { constructor() {} setCenter() {} setZoom() {} },
      Marker: class { constructor() {} setMap() {} },
      DirectionsService: class { route(_req: any, cb: any) { cb({ routes: [{}] }, 'OK'); } },
      DirectionsRenderer: class { setMap() {} setDirections() {} },
      Polyline: class { constructor() {} setMap() {} },
      LatLng: class { constructor(public lat: number, public lng: number) {} },
    },
  };
}


