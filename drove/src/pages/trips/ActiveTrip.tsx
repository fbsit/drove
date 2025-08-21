
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import RealTimeTripMap from '@/components/maps/RealTimeTripMap';
import TransferStepsBar from '@/components/trips/TransferStepsBar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransferService } from '@/services/transferService';
import { useAuth } from '@/contexts/AuthContext';

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
      
      routeTrackingInterval.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newPoint = {
              lat: latitude,
              lng: longitude,
              timestamp: Date.now()
            };
            
            setRoutePoints(prev => {
              // Evitar duplicados muy cercanos (menos de 10 metros de diferencia)
              const lastPoint = prev[prev.length - 1];
              if (lastPoint) {
                const distance = haversineMeters(
                  { lat: lastPoint.lat, lng: lastPoint.lng },
                  { lat: latitude, lng: longitude }
                );
                if (distance < 10) return prev; // No agregar si está muy cerca del último punto
              }
              
              console.log('[ROUTE_TRACKING] 📍 Nuevo punto capturado:', newPoint);
              return [...prev, newPoint];
            });
          },
          (error) => console.error('[ROUTE_TRACKING] ❌ Error GPS:', error),
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
          }
        );
      }, 10000); // Capturar punto cada 10 segundos
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
    if (trip.status === 'IN_PROGRESS') {
      const polyline = generatePolyline(routePoints);
      console.log('[FINISH_TRAVEL] 🏁 Enviando polyline:', polyline);
      console.log('[FINISH_TRAVEL] 📊 Total de puntos capturados:', routePoints.length);
      
      await TransferService.saveFinishTravelVerification(transferId, { polyline });
      await refetch();
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
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
             {trip.status === 'ASSIGNED' ? 'Traslado Asignado' : 'Traslado en Curso'}
            </h1>
            <p className="text-white/70">
              Seguimiento en tiempo real de tu traslado
            </p>
            {/* Debug info para desarrollo */}
            {trip.status === 'IN_PROGRESS' && (
              <p className="text-[#6EF7FF] text-sm mt-1">
                Puntos de ruta capturados: {routePoints.length}
              </p>
            )}
          </div>
          <Badge className={`${getStatusColor(trip.status)} text-white px-4 py-2`}>
            {getStatusText(trip.status)}
          </Badge>
        </div>

        {/* Barra de progreso */}
        <TransferStepsBar trip={trip} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm h-96">
              <CardContent className="p-0 h-full">
                <RealTimeTripMap
                  origin={{ lat: trip.startAddress.lat, lng: trip.startAddress.lng }}
                  destination={{ lat: trip.endAddress.lat, lng: trip.endAddress.lng }}
                  tripStatus={trip.status}
                />
              </CardContent>
            </Card>
          </div>

          {/* Información del traslado */}
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Detalles del Traslado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">Origen</div>
                  <div className="text-white">{trip.startAddress.address}</div>
                </div>
                <Separator className="bg-white/20" />
                <div>
                  <div className="text-sm text-white/60 mb-1">Destino</div>
                  <div className="text-white">{trip.endAddress.address}</div>
                </div>
                <Separator className="bg-white/20" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/60 mb-1">Fecha</div>
                    <div className="text-white">
                      {trip.travelDate ? new Date(trip.travelDate).toLocaleDateString() : 'No programado'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-1">Hora</div>
                    <div className="text-white">{trip.travelTime || 'TBD'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del drover */}
            {trip.droverName && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Drover Asignado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-white font-medium">{trip.droverName}</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#6EF7FF]" />
                    <span className="text-white/80">{trip.droverPhone || 'No disponible'}</span>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A]"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar Drover
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAssignedDrover && (trip.status === 'CREATED' || trip.status === 'PICKED_UP') && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleIniciarViaje}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {trip.status === 'PICKED_UP' ? 'Iniciar Viaje' : 'Recoger Vehiculo'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {trip.status === 'REQUEST_FINISH' && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Escanea el codigo QR para poder hacer la entrega.</p>
                </CardContent>
              </Card>
            )}

            {isAssignedDrover && trip.status === 'DELIVERED' && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Completado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Felicidades el traslado ha sido completado.</p>
                </CardContent>
              </Card>
            )}

            {!droverInDestination && trip.status === 'IN_PROGRESS' && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">¡Has llegado al destino!</CardTitle>
                </CardHeader>
                <CardContent className="text-white/80">
                  <Button 
                    onClick={handleFinishViaje}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar Viaje
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTrip;
