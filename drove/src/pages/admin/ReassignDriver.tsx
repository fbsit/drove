import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Loader, MapPin, Phone, AlertTriangle, RefreshCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TransferDetailsCard from '@/components/admin/transfers/TransferDetailsCard';
import DriversFilters from '@/components/admin/drivers/DriversFilters';

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

// Datos simulados para drovers (excluyendo el drover actual)
const simulatedDrivers: Driver[] = [
  {
    id: "2", 
    contactInfo: {
      fullName: "Ana López Rodríguez",
      email: "ana.lopez@email.com",
      phone: "+34 623 456 789"
    },
    rating: 4.9,
    completedTrips: 156,
    status: 'disponible',
    location: {
      address: "Avenida América 120, Madrid",
      city: "Madrid",
      distance: "4.1 km"
    }
  },
  {
    id: "3",
    contactInfo: {
      fullName: "Miguel Fernández Ruiz",
      email: "miguel.fernandez@email.com",
      phone: "+34 634 567 890"
    },
    rating: 4.7,
    completedTrips: 98,
    status: 'disponible',
    location: {
      address: "Plaza de Castilla 8, Madrid",
      city: "Madrid",
      distance: "7.2 km"
    }
  },
  {
    id: "4",
    contactInfo: {
      fullName: "Laura Sánchez Moreno",
      email: "laura.sanchez@email.com",
      phone: "+34 645 678 901"
    },
    rating: 4.6,
    completedTrips: 203,
    status: 'disponible',
    location: {
      address: "Calle Alcalá 200, Madrid",
      city: "Madrid",
      distance: "1.8 km"
    }
  },
  {
    id: "5",
    contactInfo: {
      fullName: "David González Pérez",
      email: "david.gonzalez@email.com",
      phone: "+34 656 789 012"
    },
    rating: 4.8,
    completedTrips: 145,
    status: 'disponible',
    location: {
      address: "Paseo de la Castellana 90, Madrid",
      city: "Madrid",
      distance: "3.5 km"
    }
  }
];

// Datos simulados para el traslado asignado
const simulatedTransferWithDriver: LocalTransferDetail = {
  id: "transfer-124",
  brand: "Volkswagen",
  model: "Golf",
  year: "2021",
  licensePlate: "ABC-1234",
  originAddress: "Calle Gran Vía 28, Madrid",
  destinationAddress: "Avenida Diagonal 150, Barcelona", 
  pickupDate: "2024-01-25T10:00:00Z",
  pickupTime: "10:00",
  totalPrice: 320,
  status: "asignado",
  senderName: "José María Pérez González",
  receiverName: "María Carmen López Ruiz",
  distance: 625,
  duration: 390,
  urgency: 'media',
  specialRequirements: ['Vehículo limpio', 'Entrega antes de las 18:00'],
  currentDriver: {
    id: "1",
    fullName: "Carlos Martínez García",
    email: "carlos.martinez@email.com",
    phone: "+34 612 345 678",
    rating: 4.8,
    completedTrips: 127
  }
};

// Motivos predefinidos para la reasignación
const reassignmentReasons = [
  { value: 'enfermedad', label: 'Enfermedad del drover' },
  { value: 'solicitud_cliente', label: 'Solicitud específica del cliente' },
  { value: 'optimizacion', label: 'Optimización de rutas' },
  { value: 'disponibilidad', label: 'Problemas de disponibilidad' },
  { value: 'calidad', label: 'Mejora en calidad de servicio' },
  { value: 'emergencia', label: 'Situación de emergencia' },
  { value: 'otro', label: 'Otro motivo' }
];

export const ReassignDriver: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState<LocalTransferDetail | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonType, setReasonType] = useState<string>('');
  const [reasonText, setReasonText] = useState<string>('');

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'ocupado'>('disponible');
  const [sortBy, setSortBy] = useState<'distancia' | 'rating' | 'viajes' | 'nombre'>('distancia');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // Simulamos la carga del traslado con drover asignado
        setTimeout(() => {
          setTransfer(simulatedTransferWithDriver);
          // Excluimos el drover actual de la lista
          const availableDrivers = simulatedDrivers.filter(d => d.id !== simulatedTransferWithDriver.currentDriver?.id);
          setDrivers(availableDrivers);
          setIsLoading(false);
        }, 1000);
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

  // Función para filtrar y ordenar drovers
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

  // Función para verificar si se puede confirmar la reasignación
  const canReassign = useMemo(() => {
    return selectedDriverId && reasonType && (reasonType !== 'otro' || reasonText.trim());
  }, [selectedDriverId, reasonType, reasonText]);

  // Función para obtener el mensaje de validación
  const getValidationMessage = () => {
    if (!reasonType) return "Selecciona un motivo de reasignación";
    if (reasonType === 'otro' && !reasonText.trim()) return "Describe el motivo de reasignación";
    return "";
  };

  const handleReassign = async () => {
    if (!transferId || !selectedDriverId || !reasonType) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Completa todos los campos requeridos',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const selectedDriver = drivers.find(d => d.id === selectedDriverId);
      
      // Simulamos la reasignación
      setTimeout(() => {
        toast({ 
          title: 'Drover reasignado correctamente',
          description: `${transfer?.currentDriver?.fullName} → ${selectedDriver?.contactInfo.fullName}` 
        });
        navigate('/admin/traslados');
      }, 1500);
      
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo reasignar el drover',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#22142A]">
        <Loader className="h-8 w-8 text-white animate-spin" />
        <span className="ml-2 text-white">Cargando1...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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

      {/* Información del drover actual */}
      {transfer?.currentDriver && (
        <Card className="mb-8 bg-red-500/10 border-red-500/30 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Drover Actual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-red-100">{transfer.currentDriver.fullName}</p>
                    <p className="text-sm text-red-200">{transfer.currentDriver.email}</p>
                    <p className="text-sm text-red-200">{transfer.currentDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-200">★ {transfer.currentDriver.rating} • {transfer.currentDriver.completedTrips} viajes</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivo de reasignación */}
      <Card className="mb-8 bg-white/10 text-white border-none">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Motivo de Reasignación</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason-type" className="text-white">Tipo de motivo *</Label>
              <Select value={reasonType} onValueChange={setReasonType}>
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {reassignmentReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {reasonType === 'otro' && (
              <div>
                <Label htmlFor="reason-text" className="text-white">Descripción del motivo *</Label>
                <Textarea
                  id="reason-text"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Describe el motivo de la reasignación..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  rows={3}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
            <p className="text-white/50 text-sm">
              Intenta ajustar los filtros de búsqueda para encontrar más opciones
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:justify-items-center md:justify-items-stretch">
              {filteredAndSortedDrivers.map((d) => (
                <Card
                  key={d.id}
                  className={`cursor-pointer transition hover:scale-105 w-full max-w-sm sm:max-w-none ${
                    selectedDriverId === d.id
                      ? 'border-2 border-orange-400 bg-orange-500/20'
                      : 'bg-white/10'
                  } text-white ${d.status === 'ocupado' ? 'opacity-70' : ''}`}
                  onClick={() => d.status === 'disponible' && setSelectedDriverId(d.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-orange-400 text-[#22142A] font-bold text-lg">
                          {d.contactInfo.fullName
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate">{d.contactInfo.fullName}</p>
                        <p className="text-sm text-gray-300 truncate">{d.contactInfo.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-yellow-400">★ {d.rating}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-400">{d.completedTrips} viajes</span>
                        </div>
                        <span className="text-sm font-medium text-green-400">Disponible</span>
                      </div>
                      {selectedDriverId === d.id && <Check className="text-orange-400 flex-shrink-0" />}
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
                          <p className="text-xs text-gray-400">
                            A {d.location.distance} del punto de recogida
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón de confirmación integrado en la card seleccionada */}
                    {selectedDriverId === d.id && (
                      <div className="mt-4 pt-4 border-t border-orange-400/30">
                        {!canReassign && (
                          <p className="text-sm text-orange-200 mb-3 text-center">
                            {getValidationMessage()}
                          </p>
                        )}
                        <Button
                          disabled={isSubmitting || !canReassign}
                          className="w-full bg-orange-400 text-[#22142A] hover:bg-orange-500 disabled:bg-orange-400/50 disabled:text-[#22142A]/60"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReassign();
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Reasignando...
                            </>
                          ) : (
                            <>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Confirmar Reasignación
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

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

export default ReassignDriver;
