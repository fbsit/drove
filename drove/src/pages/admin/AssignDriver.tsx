
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Loader, MapPin, Phone, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getVehicleTransfer } from '@/services/vehicleTransferService';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import TransferDetailsCard from '@/components/admin/transfers/TransferDetailsCard';
import DriversFilters from '@/components/admin/drivers/DriversFilters';
import { useTransfersManagement } from "@/hooks/admin/useTransfersManagement";

/* ────────── tipos ────────── */
interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  rating: number;
  completedTrips: number;
  status: 'disponible' | 'ocupado' | 'APPROVED';
  currentLat?: number;
  currentLng?: number;
  location: {
    address: string;
    city: string;
    distance: string;
    lat?: number;
    lng?: number;
  };
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
}

interface LocalTransferDetail {
  id: string;
  brandVehicle?: string;
  modelVehicle?: string;
  yearVehicle?: string;
  patentVehicle?: string;
  brand?: string;
  model?: string;
  year?: string;
  licensePlate?: string;
  startAddress?: {
    address: string;
  };
  endAddress?: {
    address: string;
  };
  originAddress?: string;
  destinationAddress?: string;
  travelDate?: string;
  travelTime?: string;
  pickupDate?: string;
  pickupTime?: string;
  distanceTravel?: number;
  distance?: number;
  duration?: number;
  totalPrice?: number;
  status?: string;
  personDelivery?: {
    fullName: string;
  };
  personReceive?: {
    fullName: string;
  };
  senderName?: string;
  receiverName?: string;
  urgency: 'baja' | 'media' | 'alta';
  specialRequirements?: string[];
  currentDriver?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    rating: number;
    completedTrips: number;
  };
}
/* ─────────────────────────── */

export const AssignDriver: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  console.log("Transfer ID:", transferId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReassignmentMode = Boolean(transferId && user?.role === 'admin');

  /* filtros UI (deben declararse antes de usarlos en hooks) */
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'todos' | 'disponible' | 'ocupado'>('todos');
  const [sortBy, setSortBy] =
    useState<'distancia' | 'rating' | 'viajes' | 'nombre'>('distancia');
  const [showFilters, setShowFilters] = useState(false);

  const {
    assignDriver,
    drovers,
    isLoading
  } = useTransfersManagement(undefined, { droverAvailable: statusFilter === 'disponible' ? 'true' : statusFilter === 'ocupado' ? 'false' : undefined });

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [travelDetails, setTravelDetails] = useState<LocalTransferDetail | null>(null);

  const fetchTransferDetails = async () => {
    try {
      const travelresult = await getVehicleTransfer(transferId);
      console.log("Transfer details fetched:", travelresult);
      setTravelDetails(travelresult);
    } catch (error) {
      console.error('[TRANSFERS] ❌ Error al obtener detalles del traslado:', error);
    }
  }

  useEffect(() => {
    fetchTransferDetails();
  }, []);

  /* filtros UI */

  /* filtrado + orden */
  const originCoords = useMemo(() => {
    const lat = (travelDetails as any)?.startAddress?.lat || (travelDetails as any)?.pickup?.lat || null;
    const lng = (travelDetails as any)?.startAddress?.lng || (travelDetails as any)?.pickup?.lng || null;
    return (typeof lat === 'number' && typeof lng === 'number') ? { lat, lng } : null;
  }, [travelDetails]);

  const filteredAndSortedDrivers = useMemo(() => {
    // Transform drovers to match Driver interface (tipado flexible)
    const transformedDrivers: Driver[] = (drovers as any[]).map((d: any) => ({
      id: d.id,
      full_name: d.full_name || d?.contactInfo?.fullName || '',
      email: d.email || d?.contactInfo?.email || '',
      phone: d?.contactInfo?.phone || d.phone || '',
      rating: typeof d.rating === 'number' ? d.rating : 0,
      completedTrips: Number(d?.completedTrips ?? 0),
      status: d.status === 'APPROVED' ? 'APPROVED' : 'disponible',
      currentLat: typeof d.currentLat === 'number' ? d.currentLat : undefined,
      currentLng: typeof d.currentLng === 'number' ? d.currentLng : undefined,
      location: {
        address: d?.location?.address || d?.contactInfo?.city || '—',
        city: d?.location?.city || d?.contactInfo?.city || '—',
        distance: '—',
        lat: typeof d.currentLat === 'number' ? d.currentLat : undefined,
        lng: typeof d.currentLng === 'number' ? d.currentLng : undefined,
      },
      contactInfo: {
        fullName: d.full_name || d?.contactInfo?.fullName || '',
        email: d.email || d?.contactInfo?.email || '',
        phone: d?.contactInfo?.phone || d.phone || ''
      }
    }));

    let result = [...transformedDrivers];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.contactInfo.fullName.toLowerCase().includes(s) ||
        d.contactInfo.email.toLowerCase().includes(s) ||
        d.contactInfo.phone.includes(searchTerm),
      );
    }

    if (statusFilter !== 'todos') {
      result = result.filter(d => d.status === statusFilter || d.status === 'APPROVED');
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'distancia': {
          // Si tenemos coordenadas de origen y de drovers, usar Haversine en tiempo real
          const getDist = (d: any) => {
            const lat = d?.currentLat ?? d?.location?.lat;
            const lng = d?.currentLng ?? d?.location?.lng;
            if (!originCoords || typeof lat !== 'number' || typeof lng !== 'number') return Number.POSITIVE_INFINITY;
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const R = 6371e3;
            const dLat = toRad(lat - originCoords.lat);
            const dLng = toRad(lng - originCoords.lng);
            const a1 = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(originCoords.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
            return R * c; // metros
          };
          const da = getDist(a as any);
          const db = getDist(b as any);
          return da - db;
        }
        case 'rating': return b.rating - a.rating;
        case 'viajes': return b.completedTrips - a.completedTrips;
        case 'nombre': return a.contactInfo.fullName.localeCompare(b.contactInfo.fullName);
        default: return 0;
      }
    });
    return result;
  }, [drovers, searchTerm, statusFilter, sortBy, originCoords]);

  const droverMarkers = useMemo(() => {
    const markers = (filteredAndSortedDrivers as any[]).map((d: any) => ({
      id: d.id,
      lat: (typeof d.currentLat === 'number' ? d.currentLat : d?.location?.lat),
      lng: (typeof d.currentLng === 'number' ? d.currentLng : d?.location?.lng),
      name: d?.contactInfo?.fullName,
      address: d?.location?.address || d?.location?.city || undefined,
    })).filter((m: any) => typeof m.lat === 'number' && typeof m.lng === 'number');
    try { console.log('[ASSIGN] droverMarkers', markers); } catch {}
    return markers;
  }, [filteredAndSortedDrivers]);

  const missingLocationCount = useMemo(() => {
    const total = (filteredAndSortedDrivers as any[]).length;
    const withPos = (droverMarkers as any[]).length;
    return Math.max(0, total - withPos);
  }, [filteredAndSortedDrivers, droverMarkers]);

  /* asignar / reasignar */
  const handleAssign = async (driver: Driver) => {
    if (!transferId || !driver?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selecciona un drover válido',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      await assignDriver(transferId, driver.id);

      toast({
        title: isReassignmentMode
          ? 'Drover reasignado correctamente'
          : 'Drover asignado correctamente',
        description: `${driver?.contactInfo.fullName} ha sido ${isReassignmentMode ? 'reasignado al' : 'asignado al'
          } traslado`,
      });
      // Redirigir inmediatamente tras respuesta exitosa
      setIsSubmitting(false);
      setSelectedDriverId(null);
      if (transferId) {
        navigate(`/traslados/activo/${transferId}`);
      } else {
        navigate('/admin/traslados');
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo ${isReassignmentMode ? 'reasignar' : 'asignar'
          } el drover`,
      });
      setIsSubmitting(false);
    }
  };

  /* ─────── UI ─────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#22142A]">
        <Loader className="h-8 w-8 text-white animate-spin" />
        <span className="ml-2 text-white">Cargando…</span>
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === 'disponible' ? 'text-blue-400'
      : s === 'ocupado' ? 'text-yellow-400'
        : s === 'APPROVED' ? 'text-green-400'
          : 'text-gray-400';

  const statusText = (s: string) =>
    s === 'disponible' ? 'Disponible'
      : s === 'ocupado' ? 'Ocupado'
        : s === 'APPROVED' ? 'Aprobado'
          : 'Desconocido';

  return (
    <div >
      {/* encabezado */}
      <div className="flex items-center gap-3 mb-8">
        <UserPlus className="h-8 w-8 text-[#6EF7FF]" />
        <h1 className="text-3xl font-bold text-white">
          {isReassignmentMode ? 'Reasignar Drover' : 'Asignar Drover'}
        </h1>
      </div>

      {/* detalles traslado */}
      {travelDetails ? (
        <div className="mb-8">
          <TransferDetailsCard transfer={travelDetails} droverMarkers={droverMarkers} />
        </div>
      ) : (
        <Card className="mb-8 bg-white/10 text-white border-none">
          <CardContent className="py-8 text-center">Traslado no encontrado</CardContent>
        </Card>
      )}

      {/* filtros */}
      <DriversFilters
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sortBy={sortBy} setSortBy={setSortBy}
        showFilters={showFilters} setShowFilters={setShowFilters}
      />

      {/* aviso drovers sin ubicación */}
      {missingLocationCount > 0 && (
        <div className="mb-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10 text-yellow-200 px-4 py-2 text-sm">
          {missingLocationCount} drover{missingLocationCount === 1 ? '' : 's'} sin ubicación reciente. Pide que activen el switch de disponibilidad y permisos de ubicación para aparecer en el mapa.
        </div>
      )}

      {/* debug eliminado para evitar renderizar void en JSX */}

      {/* mapa con ruta y drovers cercanos */}

      {/* lista drovers */}
      {filteredAndSortedDrivers.length === 0 ? (
        <Card className="bg-white/10 text-white border-none">
          <CardContent className="py-12 text-center">
            <p className="text-white/70 text-lg mb-2">No se encontraron drovers</p>
            <p className="text-white/50 text-sm">
              Ajusta los filtros para ver más opciones
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedDrivers.map(d => (
            <Card
              key={d.id}
              className={`text-left transition bg-white/10 text-white ${(d.status === 'ocupado') && 'opacity-70'}`}
              onClick={() => (d.status === 'disponible' || d.status === 'APPROVED') && setSelectedDriverId(d.id)}
            >
              <CardContent className="p-6">
                {/* header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-[#6EF7FF] text-[#22142A] font-bold">
                      {d?.contactInfo?.fullName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{d?.contactInfo?.fullName}</p>
                    <p className="text-sm text-gray-300 truncate">{d?.contactInfo?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-yellow-400" title={`${d?.rating?.toFixed?.(2) ?? d?.rating} / 5`}>
                        ★ {Number(d?.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400" title="Viajes completados">
                        {Number(d?.completedTrips ?? 0)} viajes
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${statusColor(d?.status)}`}>
                      {statusText(d?.status)}
                    </span>
                  </div>
                </div>

                {/* contacto */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-[#6EF7FF]" />
                    {d?.contactInfo?.phone ? (
                      <a
                        href={`tel:${String(d.contactInfo.phone).replace(/\s+/g, '')}`}
                        className="text-sm truncate underline underline-offset-2 hover:text-white"
                      >
                        {d.contactInfo.phone}
                      </a>
                    ) : (
                      <span className="text-sm truncate">—</span>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-[#6EF7FF] mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{d?.location?.address}</p>
                      <p className="text-xs text-gray-400">
                        A {d?.location?.distance} del punto de recogida
                      </p>
                    </div>
                  </div>
                </div>

                {/* botón asignar */}
                {d?.status === 'APPROVED' && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button
                      disabled={isSubmitting}
                      className="w-full bg-[#6EF7FF] text-[#22142A] hover:bg-[#6EF7FF]/80"
                      onClick={(e) => { e.stopPropagation(); handleAssign(d); }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {isReassignmentMode ? 'Reasignando…' : 'Asignando…'}
                        </>
                      ) : (
                        isReassignmentMode ? 'Reasignar Conductor' : 'Asignar Conductor'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* pie */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          variant="ghost"
          className="border-white text-white hover:bg-white hover:text-[#22142A]"
          onClick={() => navigate('/admin/traslados')}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default AssignDriver;
