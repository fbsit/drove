
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, CheckCircle, AlertCircle, ArrowLeft, Car, DollarSign, ShieldCheck, Route as RouteIcon, Map as MapIcon, Calendar as CalendarIcon, Clock as ClockIcon, Copy as CopyIcon, FileDown } from 'lucide-react';
import RealTimeTripMap from '@/components/maps/RealTimeTripMap';
import TransferStepsBar from '@/components/trips/TransferStepsBar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransferService } from '@/services/transferService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TripStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp?: string;
}

const haversineMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const R = 6_371_000;            // radio medio terrestre en m
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;

  const h =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const ActiveTrip: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [droverInDestination, setDroverInDestination] = useState(false);
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number; timestamp: number }>>([]);
  const watchId = useRef<number>();
  const routeTrackingInterval = useRef<NodeJS.Timeout>();
  const [showMap, setShowMap] = useState(false);
  

  const { data: trip, isLoading, refetch } = useQuery({
    queryKey: ['active-trip', transferId],
    queryFn: async () => {
      if (!transferId) throw new Error('Trip ID is required');
      console.log('[ACTIVE_TRIP] 🔄 Obteniendo detalles del viaje:', transferId);
      
      try {
        const response = await TransferService.getTransferById(transferId);
        console.log('[ACTIVE_TRIP] ✅ Detalles del viaje obtenidos:', response);
        return response;
      } catch (error) {
        console.error('[ACTIVE_TRIP] ❌ Error al obtener detalles:', error);
        throw error;
      }
    },
    enabled: !!transferId,
    refetchInterval: 30000
  });

  // Capturar ruta cuando el viaje está en progreso
  useEffect(() => {
    if (trip?.status === 'IN_PROGRESS' && 'geolocation' in navigator) {
      console.log('[ROUTE_TRACKING] 🚗 Iniciando captura de ruta');

      const capturePosition = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newPoint = { lat: latitude, lng: longitude, timestamp: Date.now() };
            setRoutePoints(prev => {
              const lastPoint = prev[prev.length - 1];
              if (lastPoint) {
                const distance = haversineMeters(
                  { lat: lastPoint.lat, lng: lastPoint.lng },
                  { lat: latitude, lng: longitude }
                );
                if (distance < 10) return prev;
              }
              console.log('[ROUTE_TRACKING] 📍 Nuevo punto capturado:', newPoint);
              return [...prev, newPoint];
            });
          },
          (error) => console.error('[ROUTE_TRACKING] ❌ Error GPS:', error),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      };

      // Captura inmediata y luego intervalos
      capturePosition();
      routeTrackingInterval.current = setInterval(capturePosition, 10000);
    }

    return () => {
      if (routeTrackingInterval.current) {
        clearInterval(routeTrackingInterval.current);
        console.log('[ROUTE_TRACKING] 🛑 Deteniendo captura de ruta');
      }
    };
  }, [trip?.status]);

  // Generar polyline string a partir de los puntos
  const generatePolyline = (points: Array<{ lat: number; lng: number; timestamp: number }>): string => {
    if (points.length === 0) return '';
    
    // Convertir puntos a formato simple "lat,lng;lat,lng;..."
    return points
      .map(point => `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`)
      .join(';');
  };

  useEffect(() => {
    if (!trip?.endAddress || trip.status !== 'IN_PROGRESS') return;

    if ('geolocation' in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const distance = haversineMeters(
            { lat: latitude, lng: longitude },
            { lat: trip.endAddress.lat, lng: trip.endAddress.lng }
          );

          setDroverInDestination(distance <= 100);
        },
        (err) => console.error('[GEO] ❌', err),
        {
          enableHighAccuracy: true,
          maximumAge: 5_000,
          timeout: 20_000,
        }
      );
    } else {
      console.warn('[GEO] Geolocation API no disponible');
    }

    return () => {
      if (watchId.current !== undefined) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [trip?.endAddress]);

  const getNextStatus = (currentStatus: string): string | null => {
    console.log("currentStatus", currentStatus);
    const statusFlow = {
      'PENDINGPAID': 'CREATED',
      'CREATED': 'ASSIGNED',
      'ASSIGNED': 'PICKED_UP',
      'PICKED_UP': 'IN_PROGRESS',
      'IN_PROGRESS': 'REQUEST_FINISH',
      'REQUEST_FINISH': 'DELIVERED',
      'DELIVERED': 'COMPLETED'
    };
    console.log("statusFlow", statusFlow[currentStatus as keyof typeof statusFlow]);
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const getStatusText = (status: string): string => {
    const statusTexts = {
      'PENDINGPAID': 'Pendiente de Pago',
      'CREATED': 'Creado',
      'ASSIGNED': 'Drover Asignado',
      'PICKED_UP': 'Vehículo Recogido',
      'IN_PROGRESS': 'En Progreso',
      'REQUEST_FINISH': 'Solicitando Entrega',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDINGPAID': return 'bg-yellow-500';
      case 'CREATED': return 'bg-blue-500';
      case 'ASSIGNED': return 'bg-indigo-500';
      case 'PICKED_UP': return 'bg-orange-500';
      case 'IN_PROGRESS': return 'bg-purple-500';
      case 'REQUEST_FINISH': return 'bg-amber-500';
      case 'DELIVERED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Check if current user is the assigned drover
  const isAssignedDrover = user?.id === trip?.droverId;

  const handleIniciarViaje = async () => {
    if(trip.status === 'PICKED_UP') {
      await TransferService.saveInitTravelVerification(transferId);
      await refetch();
    } else {
      navigate(`/verificacion/recogida/${transferId}`);
    }
  };

  const handleFinishViaje = async () => {
    if (trip.status !== 'IN_PROGRESS') return;

    // Generar polyline; si no hay puntos, usa origen/destino como fallback
    let points = routePoints;
    if (!points || points.length === 0) {
      if (trip.startAddress && trip.endAddress) {
        points = [
          { lat: trip.startAddress.lat, lng: trip.startAddress.lng, timestamp: Date.now() - 1 },
          { lat: trip.endAddress.lat, lng: trip.endAddress.lng, timestamp: Date.now() },
        ];
      }
    }
    const polyline = generatePolyline(points || []);
    console.log('[FINISH_TRAVEL] 🏁 Enviando polyline:', polyline);
    console.log('[FINISH_TRAVEL] 📊 Total de puntos capturados:', points?.length || 0);

    try {
      // Obtener ubicación actual para validar en backend (regla <=100km)
      let coords: { latitude: number; longitude: number } | null = null;
      if (navigator.geolocation) {
        try {
          coords = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos.coords as any),
              (err) => resolve(null),
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
            );
          });
        } catch {}
      }

      await TransferService.saveFinishTravelVerification(transferId, {
        polyline,
        currentLat: coords?.latitude,
        currentLng: coords?.longitude,
      } as any);
      toast({ title: 'Viaje finalizado', description: 'Se registró la ruta del traslado.' });
      await refetch();
    } catch (err: any) {
      console.error('[FINISH_TRAVEL] ❌ Error al finalizar viaje', err);
      toast({ variant: 'destructive', title: 'Error al finalizar', description: err?.message || 'Intenta de nuevo.' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Cargando detalles del viaje...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-white/70 text-lg">Viaje no encontrado</p>
            <Button 
              onClick={() => navigate('/cliente/transfers')}
              className="mt-4"
            >
              Volver a Traslados
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nextStatus = getNextStatus(trip.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 text-white/80">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-white">
            <ArrowLeft className="h-5 w-5" /> Volver
          </button>
        </div>

        {/* Title + meta */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Helvetica' }}>
              Traslado #{String(trip.id).slice(0,8)}
            </h1>
            <p className="text-white/60 mt-2">Creado el {new Date(trip.createdAt || trip.travelDate || Date.now()).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <Badge className={`${getStatusColor(trip.status)} text-white px-4 py-2`}>{getStatusText(trip.status)}</Badge>
        </div>

        {/* Steps */}
        <TransferStepsBar trip={trip} />

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehículo */}
          <Card className="bg-gradient-to-br from-cyan-900/30 to-cyan-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Car className="h-5 w-5 text-[#6EF7FF]" /> Vehículo
              </CardTitle>
              <p className="text-white/60 text-sm -mt-2">Detalles del automóvil</p>
            </CardHeader>
            <CardContent className="text-white space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Marca y Modelo:</span>
                <span className="font-semibold text-right">{trip.brandVehicle || trip.vehicle?.brand} {trip.modelVehicle || trip.vehicle?.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Año:</span>
                <span>{trip.yearVehicle || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Matrícula:</span>
                <span className="text-[#6EF7FF] font-semibold">{trip.patentVehicle || trip.licensePlate || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">VIN:</span>
                <span className="font-mono text-xs">{trip.bastidor || '-'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Ganancia estimada */}
          <Card className="bg-gradient-to-br from-green-900/20 to-green-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-300" /> Ganancia Estimada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300">€{Number(trip.totalPrice ?? 0).toFixed(2)}</div>
              <div className="text-white/60 text-sm mt-2">Esta es tu ganancia neta estimada</div>
            </CardContent>
          </Card>

          {/* Información */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-300" /> Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white font-semibold">{getStatusText(trip.status)}</div>
              <div className="text-white/60 text-sm mt-1">{trip.status === 'DELIVERED' ? 'Entregado con éxito' : 'Proceso en curso'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Ruta del traslado */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <RouteIcon className="h-6 w-6 text-[#6EF7FF]" />
              <div>
                <CardTitle className="text-white">Ruta del Traslado</CardTitle>
                <div className="text-white/60 text-sm">Origen y destino del vehículo</div>
              </div>
            </div>
            <Button onClick={() => setShowMap((v) => !v)} variant="outline" className="rounded-2xl border-[#6EF7FF]/40 text-white bg-white/5 hover:bg-white/10">
              <MapIcon className="h-4 w-4 mr-2 text-[#6EF7FF]" /> {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {showMap && (
              <div className="rounded-xl border border-white/10 bg-white/5 h-64 md:h-72 lg:h-80 overflow-hidden">
                <RealTimeTripMap
                  origin={{ lat: trip.startAddress.lat, lng: trip.startAddress.lng }}
                  destination={{ lat: trip.endAddress.lat, lng: trip.endAddress.lng }}
                  tripStatus={trip.status}
                />
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-green-400"></div>
                <div>
                  <div className="text-white/60 text-sm">Origen</div>
                  <div className="text-white font-semibold">{trip.startAddress?.address || trip.startAddress?.city}</div>
                  <div className="text-white/40 text-xs">Punto de recogida</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-rose-500"></div>
                <div>
                  <div className="text-white/60 text-sm">Destino</div>
                  <div className="text-white font-semibold">{trip.endAddress?.address || trip.endAddress?.city}</div>
                  <div className="text-white/40 text-xs">Punto de entrega</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-white/60 text-sm">Distancia</div>
                <div className="text-[#6EF7FF] text-2xl font-bold">{trip.distanceTravel || '—'}</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="text-white/60 text-sm">Duración</div>
                <div className="text-[#6EF7FF] text-2xl font-bold">{trip.timeTravel || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programación */}
        {trip.travelDate && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex items-center gap-3 p-5 text-white">
              <CalendarIcon className="h-5 w-5 text-[#6EF7FF]" />
              <div>
                <div className="text-white/60 text-sm">RECOGIDA PROGRAMADA</div>
                <div className="text-lg font-semibold">{new Date(trip.travelDate).toLocaleDateString()} {trip.travelTime ? `- ${trip.travelTime}` : ''}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Callout final */}
        {trip.status === 'DELIVERED' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/40 mx-auto flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
              </div>
              <div className="text-white text-xl font-semibold">Traslado entregado</div>
              <div className="text-white/70 mt-2">Este traslado ha sido marcado como entregado exitosamente.</div>
            </CardContent>
          </Card>
        )}

        {/* Footer actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" className="rounded-2xl bg-white/5 border-white/20 text-white" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver a traslados
          </Button>
          <Button variant="outline" className="rounded-2xl bg-white/5 border-white/20 text-white" onClick={async () => { try { await navigator.clipboard.writeText(String(trip.id)); toast({ title: 'ID copiado', description: String(trip.id) }); } catch {} }}>
            <CopyIcon className="h-4 w-4 mr-2" /> Copiar ID
          </Button>
          <Button variant="outline" disabled={!trip?.invoiceUrl && !trip?.pdfUrl} className="rounded-2xl bg-white/5 border-white/20 text-white" onClick={() => { const url = (trip as any)?.invoiceUrl || (trip as any)?.pdfUrl; if (url) window.open(url, '_blank'); }}>
            <FileDown className="h-4 w-4 mr-2" /> Descargar PDF
          </Button>
        </div>

        {/* mapa al interior de la sección de ruta cuando showMap === true */}
      </div>
    </div>
  );
};

export default ActiveTrip;
