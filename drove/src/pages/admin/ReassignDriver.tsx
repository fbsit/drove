import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Loader, MapPin, Phone, AlertTriangle, RefreshCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TransferDetailsCard from '@/components/admin/transfers/TransferDetailsCard';
import DriversFilters from '@/components/admin/drivers/DriversFilters';
import { AdminService } from '@/services/adminService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Tipos específicos para este componente
interface Driver {
  id: string;
  contactInfo: { fullName: string; email: string; phone: string };
  rating: number;
  completedTrips: number;
  status: 'disponible' | 'ocupado';
  location: {
    address: string;
    city: string;
    distance: string;
  };
}

interface LocalTransferDetail {
  id: string;
  brand?: string;
  model?: string;
  year?: string;
  licensePlate?: string;
  originAddress?: string;
  destinationAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  totalPrice?: number;
  status?: string;
  senderName?: string;
  receiverName?: string;
  distance?: number;
  duration?: number;
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

// Eliminamos mocks. Se usará backend real.

export const ReassignDriver: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState<LocalTransferDetail | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonText, setReasonText] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'ocupado'>('disponible');
  const [sortBy, setSortBy] = useState<'distancia' | 'rating' | 'viajes' | 'nombre'>('distancia');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        // 1) Obtener detalles reales del traslado por ID
        const transfer = await (await import('@/services/transferService')).TransferService.getTransferById(String(transferId));
        if (!transfer) throw new Error('Traslado no encontrado');

        const current = transfer?.drover || transfer?.assignedDrover || transfer?.driver;
        const local: LocalTransferDetail = {
          id: String(transfer.id),
          brand: transfer.brandVehicle || transfer.vehicle?.brand,
          model: transfer.modelVehicle || transfer.vehicle?.model,
          year: transfer.yearVehicle || transfer.vehicle?.year,
          licensePlate: transfer.patentVehicle || transfer.vehicle?.licensePlate,
          originAddress: transfer.startAddress?.address || transfer.startAddress?.city,
          destinationAddress: transfer.endAddress?.address || transfer.endAddress?.city,
          pickupDate: transfer.travelDate,
          pickupTime: transfer.travelTime,
          totalPrice: transfer.totalPrice,
          status: transfer.status,
          senderName: transfer.personDelivery?.fullName,
          receiverName: transfer.personReceive?.fullName,
          distance: transfer.distanceTravel,
          duration: transfer.timeTravel,
          urgency: 'media',
          currentDriver: current ? {
            id: String(current.id),
            fullName: current.contactInfo?.fullName || current.full_name || current.name,
            email: current.email,
            phone: current.contactInfo?.phone || current.phone,
            rating: current.rating || 0,
            completedTrips: current.completedTrips || 0,
          } : undefined,
        } as LocalTransferDetail;
        setTransfer(local);

        // 2) Obtener drovers reales y excluir el actual
        const drovers = await AdminService.getDrovers();
        const mapped: Driver[] = (drovers || []).map((d:any) => {
          const rawStatus = String(d.status || d?.contactInfo?.status || '').toLowerCase();
          const isAvailable = ['active','approved','disponible','available','activo'].includes(rawStatus);
          return {
            id: String(d.id),
            contactInfo: {
              fullName: d?.contactInfo?.fullName || d.full_name || d.name || 'Drover',
              email: d.email,
              phone: d?.contactInfo?.phone || d.phone || '',
            },
            rating: Number(d.rating || 0),
            completedTrips: Number(d.completedTrips || 0),
            status: isAvailable ? 'disponible' : 'ocupado',
            location: { address: d.city || '—', city: d.city || '—', distance: d.distance ? String(d.distance) : '999999' },
          } as Driver;
        });
        const withoutCurrent = mapped.filter(d => d.id !== local.currentDriver?.id);
        setDrivers(withoutCurrent);
        setIsLoading(false);
      } catch (e) {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos',
        });
        setIsLoading(false);
      }
    })();
  }, [transferId]);

  // Filtrar y ordenar drovers
  const filteredAndSortedDrivers = useMemo(() => {
    let filtered = drivers;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(driver =>
        driver.contactInfo.fullName.toLowerCase().includes(searchLower) ||
        driver.contactInfo.email.toLowerCase().includes(searchLower) ||
        driver.contactInfo.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(driver => driver.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distancia':
          return parseFloat(a.location.distance) - parseFloat(b.location.distance);
        case 'rating':
          return b.rating - a.rating;
        case 'viajes':
          return b.completedTrips - a.completedTrips;
        case 'nombre':
          return a.contactInfo.fullName.localeCompare(b.contactInfo.fullName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [drivers, searchTerm, statusFilter, sortBy]);

  const performReassign = async () => {
    if (!transferId || !selectedDriverId || !reasonText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Falta información',
        description: 'Debes ingresar un motivo para continuar.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedDriver = drivers.find(d => d.id === selectedDriverId);
      await AdminService.assignDriver(String(transferId), selectedDriverId, 'admin');

      // Refrescar traslado para mostrar el nuevo drover en la UI
      const refreshed = await (await import('@/services/transferService')).TransferService.getTransferById(String(transferId));
      const current = refreshed?.drover || refreshed?.assignedDrover || refreshed?.driver;
      setTransfer(prev => prev ? {
        ...prev,
        currentDriver: current ? {
          id: String(current.id),
          fullName: current.contactInfo?.fullName || current.full_name || current.name,
          email: current.email,
          phone: current.contactInfo?.phone || current.phone,
          rating: current.rating || 0,
          completedTrips: current.completedTrips || 0,
        } : undefined,
      } : prev);

      toast({ title: 'Drover reasignado correctamente', description: `${transfer?.currentDriver?.fullName} → ${selectedDriver?.contactInfo.fullName}` });
      setConfirmOpen(false);
      setIsSubmitting(false);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo reasignar el drover' });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#22142A]">
        <Loader className="h-8 w-8 text-white animate-spin" />
        <span className="ml-2 text-white">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-8">
        <RefreshCcw className="h-8 w-8 text-orange-400" />
        <h1 className="text-3xl font-bold text-white">Reasignar Drover</h1>
      </div>

      {transfer ? (
        <div className="mb-8">
          <TransferDetailsCard transfer={transfer} />
        </div>
      ) : (
        <Card className="mb-8 bg-white/10 text-white border-none">
          <CardContent className="py-8 text-center">Traslado no encontrado</CardContent>
        </Card>
      )}

      {/* Filtros de búsqueda */}
      <DriversFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Selecciona el Nuevo Drover
          {filteredAndSortedDrivers.length !== drivers.length && (
            <span className="text-sm font-normal text-white/70 ml-2">
              ({filteredAndSortedDrivers.length} de {drivers.length} drovers disponibles)
            </span>
          )}
        </h2>
      </div>

      {/* Lista de drovers */}
      {filteredAndSortedDrivers.length === 0 ? (
        <Card className="bg-white/10 text-white border-none">
          <CardContent className="py-12 text-center">
            <p className="text-white/70 text-lg mb-2">No se encontraron drovers disponibles</p>
            <p className="text-white/50 text-sm">Intenta ajustar los filtros de búsqueda para encontrar más opciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:justify-items-center md:justify-items-stretch">
              {filteredAndSortedDrivers.map((d) => (
                <Card
                  key={d.id}
                  className={`w-full max-w-sm sm:max-w-none bg-white/10 text-white cursor-pointer transition transform ${d.status === 'ocupado' ? 'opacity-70' : ''} ${selectedDriverId === d.id ? 'ring-2 ring-orange-400 scale-[1.01]' : 'hover:bg-white/15 hover:scale-[1.01]'}`}
                  onClick={() => { if (d.status === 'disponible') { setSelectedDriverId(d.id); setConfirmOpen(true); } }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-orange-400 text-[#22142A] font-bold text-lg">
                          {d.contactInfo.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-lg truncate">{d.contactInfo.fullName}</p>
                        <p className="text-sm text-gray-300 truncate">{d.contactInfo.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-yellow-400">★ {d.rating}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-400">{d.completedTrips} viajes</span>
                        </div>
                        <span className="text-sm font-medium text-green-400">Disponible</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-orange-400 flex-shrink-0" />
                        <span className="text-sm truncate">{d.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{d.location.address}</p>
                          <p className="text-xs text-gray-400">A {d.location.distance} del punto de recogida</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-orange-400/30">
                      <Button
                        disabled={isSubmitting || !selectedDriverId}
                        className="w-full bg-orange-400 text-[#22142A] hover:bg-orange-500 disabled:bg-orange-400/50 disabled:text-[#22142A]/60"
                        onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
                      >
                        {isSubmitting ? (<><Loader className="mr-2 h-4 w-4 animate-spin" />Reasignando...</>) : (<><RefreshCcw className="mr-2 h-4 w-4" />Confirmar Reasignación</>)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="ghost" className="border-white text-white hover:bg-white hover:text-[#22142A]" onClick={() => navigate('/admin/traslados')}>Cancelar</Button>
      </div>

      {/* Modal de confirmación y motivo */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-[#22142A] text-white border border-white/10">
          <DialogHeader>
            <DialogTitle>Confirmar reasignación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Describe el motivo *</Label>
              <Textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder="Describe el motivo de la reasignación..." className="bg-white/10 border-white/20 text-white placeholder:text-white/50" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="text-white">Cancelar</Button>
            <Button disabled={isSubmitting || !selectedDriverId || !reasonText.trim()} onClick={performReassign} className="bg-orange-400 text-[#22142A] hover:bg-orange-500">{isSubmitting ? 'Reasignando…' : 'Confirmar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReassignDriver;
