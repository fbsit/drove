import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DroveButton } from '@/components/DroveButton';
import { 
  Car, MapPin, Calendar, Clock, FileText, 
  CreditCard, User, Star, CheckCircle, Loader2
} from 'lucide-react';
import { VehicleTransferService } from '@/services/vehicleTransferService';
import { UserService } from '@/services/userService';

// Nuevo: avatar drover minimalista
function DroverAvatar({ name, photo }: { name?: string; photo?: string }) {
  if (photo)
    return (
      <img
        src={photo}
        alt={name ? `Foto de ${name}` : "Drover"}
        className="w-10 h-10 rounded-full object-cover bg-gray-200 border-2 border-[#6EF7FF]/60"
      />
    );
  // Si no hay foto: mostrar inicial
  const initial = name ? name.trim().charAt(0).toUpperCase() : "D";
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#6EF7FF]/80 text-[#22142A] font-bold text-lg border-2 border-[#6EF7FF]/40">
      {initial}
    </div>
  );
}

interface Trip {
  id: string;
  created_at: string;
  status: string;
  pickup_details: {
    originAddress: string;
    destinationAddress: string;
    pickupDate: string;
    pickupTime: string;
  };
  vehicle_details: {
    brand: string;
    model: string;
    licensePlate: string;
  };
  transfer_details: {
    duration: number;
    distance: number;
    totalPrice: number;
  };
  payment_method: string;
  client_id: string | null;
  driver_id: string | null;
}

interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  photo?: string;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determinar la ruta de regreso según el tipo de usuario
  const getDashboardPath = () => {
    if (user?.user_type === 'client') {
      return "/cliente/dashboard";
    } else if (user?.user_type === 'drover') {
      return "/drover/dashboard";
    }
    return "/admin/dashboard";
  };

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        console.log('[TRIP_DETAIL] 🔄 Obteniendo detalles del traslado:', id);
        
        // Obtener los detalles del viaje desde la API
        const apiData = await VehicleTransferService.getVehicleTransfer(id);
        console.log('[TRIP_DETAIL] ✅ Datos del traslado obtenidos:', apiData);
        
        if (!apiData) {
          throw new Error('Traslado no encontrado');
        }
        
        // Mapear la respuesta de la API al formato esperado por los componentes
        const formattedTrip: Trip = {
          id: apiData.id,
          created_at: apiData.created_at || apiData.createdAt || new Date().toISOString(),
          status: mapStatusFromApi(apiData.status),
          pickup_details: {
            originAddress: apiData.originAddress || '',
            destinationAddress: apiData.destinationAddress || '',
            pickupDate: apiData.pickupDate || '',
            pickupTime: apiData.pickupTime || ''
          },
          vehicle_details: {
            brand: apiData.brand || '',
            model: apiData.model || '',
            licensePlate: apiData.licensePlate || ''
          },
          transfer_details: {
            duration: apiData.duration || 0,
            distance: apiData.distance || 0,
            totalPrice: apiData.totalPrice || 0
          },
          payment_method: apiData.paymentMethod || 'card',
          client_id: apiData.idClient || null,
          driver_id: apiData.driverId || null
        };
        
        setTrip(formattedTrip);
        
        // If driver is assigned, fetch driver details
        if (apiData.driverId) {
          try {
            console.log('[TRIP_DETAIL] 🔄 Obteniendo datos del drover:', apiData.driverId);
            const driverData = await UserService.getUserById(apiData.driverId);
            console.log('[TRIP_DETAIL] ✅ Datos del drover obtenidos:', driverData);
            
            if (driverData) {
              setDriver({
                id: driverData.id,
                full_name: driverData.fullName || driverData.full_name || 'Drover',
                email: driverData.email || '',
                phone: driverData.phone || '',
                photo: driverData.photoUrl || driverData.photo || undefined
              });
            }
          } catch (driverError) {
            console.error('[TRIP_DETAIL] ❌ Error fetching driver details:', driverError);
          }
        }
        
        // If viewing as admin or driver, fetch client details
        if (apiData.idClient && (user?.user_type === 'admin' || user?.user_type === 'drover')) {
          try {
            console.log('[TRIP_DETAIL] 🔄 Obteniendo datos del cliente:', apiData.idClient);
            const clientData = await UserService.getUserById(apiData.idClient);
            console.log('[TRIP_DETAIL] ✅ Datos del cliente obtenidos:', clientData);
            
            if (clientData) {
              setClient({
                id: clientData.id,
                full_name: clientData.fullName || clientData.full_name || 'Cliente',
                email: clientData.email || '',
                phone: clientData.phone || ''
              });
            }
          } catch (clientError) {
            console.error('[TRIP_DETAIL] ❌ Error fetching client details:', clientError);
          }
        }
        
      } catch (error) {
        console.error('[TRIP_DETAIL] ❌ Error fetching trip details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetails();
  }, [id, user]);

  // Función para mapear los estados del API a los estados utilizados en la aplicación
  function mapStatusFromApi(apiStatus: string): string {
    switch (apiStatus) {
      case 'CREATED': return 'pendiente';
      case 'ASSIGNED': return 'asignado';
      case 'PICKED_UP': return 'en_progreso';
      case 'DELIVERED': return 'completado';
      case 'CANCELLED': return 'cancelado';
      default: return apiStatus?.toLowerCase() || 'pendiente';
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  // Get payment method text
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Tarjeta de Crédito';
      case 'transfer': return 'Transferencia Bancaria';
      default: return method;
    }
  };

  // == NUEVO: lógica de visibilidad para cliente ==
  const isClient = user?.user_type === 'client';

  return (
    <DashboardLayout pageTitle="Detalle del Traslado">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF] mr-2" />
          <p className="text-white">Cargando detalles del traslado...</p>
        </div>
      ) : trip ? (
        <div>
          {/* Header with Invoice-like Title */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Traslado: #{trip.id.substring(0, 8)}</h1>
              <p className="text-white/70">
                Creado el {formatDate(trip.created_at)}
              </p>
            </div>
            <div className="flex gap-3">
              <DroveButton 
                variant="outline" 
                size="sm"
                icon={<FileText size={18} />}
              >
                Descargar PDF
              </DroveButton>
              <Link to={getDashboardPath()}>
                <DroveButton variant="default" size="sm">
                  Volver
                </DroveButton>
              </Link>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-[#6EF7FF]/10 text-[#6EF7FF] px-4 py-2 rounded-full">
            <CheckCircle size={18} />
            <span>
              {trip.status === "completado"
                ? "Traslado completado"
                : trip.status === "cancelado"
                ? "Traslado cancelado"
                : "Traslado en curso"}
            </span>
          </div>
          
          {/* Grid main info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Service Details Card */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Car className="h-6 w-6 text-[#6EF7FF]" />
                <h2 className="text-xl font-bold text-white">Detalles del Servicio</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-white/60 text-sm block">Tipo de Servicio</span>
                  <span className="text-white font-medium">
                    Traslado de Vehículo
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">Vehículo</span>
                  <span className="text-white font-medium">
                    {trip.vehicle_details.brand} {trip.vehicle_details.model}
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">Matrícula</span>
                  <span className="text-white font-medium">
                    {trip.vehicle_details.licensePlate}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <span className="text-white">
                    {formatDate(trip.pickup_details.pickupDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-white">
                    {trip.pickup_details.pickupTime}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Route Info Card */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-[#6EF7FF]" />
                <h2 className="text-xl font-bold text-white">Información de Ruta</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-white/60 text-sm block">Origen</span>
                  <span className="text-white font-medium">
                    {trip.pickup_details.originAddress}
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">Destino</span>
                  <span className="text-white font-medium">
                    {trip.pickup_details.destinationAddress}
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">Distancia</span>
                  <span className="text-white font-medium">
                    {Math.round(trip.transfer_details.distance)} km
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">Tiempo Estimado</span>
                  <span className="text-white font-medium">
                    {Math.floor(trip.transfer_details.duration / 60)} horas
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment Details Card */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-[#6EF7FF]" />
                <h2 className="text-xl font-bold text-white">Detalles de Pago</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-white/60 text-sm block">Método de Pago</span>
                  <span className="text-white font-medium">
                    {getPaymentMethodText(trip.payment_method)}
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">Subtotal</span>
                  <span className="text-white font-medium">
                    {(trip.transfer_details.totalPrice * 0.79).toFixed(2)} €
                  </span>
                </div>
                
                <div>
                  <span className="text-white/60 text-sm block">IVA (21%)</span>
                  <span className="text-white font-medium">
                    {(trip.transfer_details.totalPrice * 0.21).toFixed(2)} €
                  </span>
                </div>
                
                <div className="pt-2 border-t border-white/10">
                  <span className="text-white/60 text-sm block">Total</span>
                  <span className="text-[#6EF7FF] font-bold text-xl">
                    {trip.transfer_details.totalPrice.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* SOLO para clientes: mostrar bloque "Drover asignado", NO datos de contacto */}
          {isClient && driver && (
            <div className="mb-8">
              <div className="bg-white/10 rounded-2xl p-6 flex items-center gap-4 shadow">
                <DroverAvatar name={driver.full_name} photo={driver.photo} />
                <div>
                  <p className="text-white/80 font-montserrat text-xs mb-1">Drover asignado</p>
                  <p className="text-white font-bold text-lg">{driver.full_name}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* SOLO para admins/drovers: mostrar sección personas (igual que antes) */}
          {!isClient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Driver Card */}
              {driver && (
                <div className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-6 w-6 text-[#6EF7FF]" />
                    <h2 className="text-xl font-bold text-white">Drover</h2>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <DroverAvatar name={driver.full_name} photo={driver.photo} />
                    <div>
                      <p className="text-white text-lg font-medium">{driver.full_name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-4 w-4 text-[#6EF7FF] fill-[#6EF7FF]" />
                        ))}
                        <span className="text-white ml-2">5.0</span>
                      </div>
                      <p className="text-white/60 text-sm">{driver.email}</p>
                      <p className="text-white/60 text-sm">{driver.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Client Card - Only shown to admins and drivers */}
              {client && user?.user_type !== 'client' && (
                <div className="bg-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-6 w-6 text-[#6EF7FF]" />
                    <h2 className="text-xl font-bold text-white">Cliente</h2>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/10 h-16 w-16 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    
                    <div>
                      <p className="text-white text-lg font-medium">{client.full_name}</p>
                      <p className="text-white/60 text-sm">{client.email}</p>
                      <p className="text-white/60 text-sm">{client.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-4">
            <Link to={getDashboardPath()}>
              <DroveButton variant="outline" size="lg">
                Volver al Panel
              </DroveButton>
            </Link>
            
            {isClient && (
              <Link to="/solicitar-traslado">
                <DroveButton variant="default" size="lg">
                  Nuevo Traslado
                </DroveButton>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Traslado no encontrado</h2>
          <p className="text-white/70 mb-6">
            No se encontró la información del traslado solicitado.
          </p>
          <Link to={getDashboardPath()}>
            <DroveButton variant="default">
              Volver al Panel
            </DroveButton>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TripDetail;
