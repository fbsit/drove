
import React, { useState } from 'react';
import {
  Car,
  MapPin,
  Clock,
  User,
  Phone,
  Euro,
  Route,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Timer,
  Target,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from '@/hooks/use-toast';
import RescheduleModal from './RescheduleModal';
import { formatDateTimeEs } from '@/utils/datetime';
import GoogleMapComponent from "@/components/maps/GoogleMap";

interface LocalTransferDetail {
  id: string;
  // Vehicle properties - matching the usage in the component
  brandVehicle?: string;
  modelVehicle?: string;
  yearVehicle?: string;
  patentVehicle?: string;
  // Legacy properties for compatibility
  brand?: string;
  model?: string;
  year?: string;
  licensePlate?: string;
  // Address properties - matching the usage
  startAddress?: {
    address: string;
  };
  endAddress?: {
    address: string;
  };
  // Legacy address properties
  originAddress?: string;
  destinationAddress?: string;
  // Date/time properties - matching the usage
  travelDate?: string;
  travelTime?: string;
  pickupDate?: string;
  pickupTime?: string;
  // Distance and other transfer details
  distanceTravel?: number;
  distance?: number;
  duration?: number;
  totalPrice?: number | string;
  status?: string;
  // Person details - matching the usage
  personDelivery?: {
    fullName: string;
  };
  personReceive?: {
    fullName: string;
  };
  // Legacy person properties
  senderName?: string;
  receiverName?: string;
  urgency: 'baja' | 'media' | 'alta';
  specialRequirements?: string[];
  isRescheduled?: boolean;
  rescheduleReason?: string;
}

interface TransferDetailsCardProps {
  transfer: LocalTransferDetail;
  droverMarkers?: Array<{ id: string; lat: number; lng: number; name?: string }>;
}

const TransferDetailsCard: React.FC<TransferDetailsCardProps> = ({ transfer: initialTransfer, droverMarkers = [] }) => {
  const [transfer, setTransfer] = useState(initialTransfer);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);

  console.log('TransferDetailsCard render - transfer status:', transfer.status);
  console.log('Show reschedule button?', ["pendiente", "asignado"].includes(transfer.status || ""));

  const formatDate = (dateStr?: string, timeStr?: string) => {
    return formatDateTimeEs(dateStr, timeStr) || '—';
  };

  const handleReschedule = (newDate: Date, newTime: string, reason: string) => {
    // Persist date-only string to avoid timezone shifts; keep time separately
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    const dateOnly = `${yyyy}-${mm}-${dd}`;

    setTransfer(prev => ({
      ...prev,
      pickupDate: dateOnly,
      pickupTime: newTime,
      travelDate: dateOnly,
      travelTime: newTime,
      isRescheduled: true,
      rescheduleReason: reason
    }));

    toast({
      title: 'Traslado reprogramado exitosamente',
      description: `Nueva fecha: ${newDate.toLocaleDateString('es-ES')} a las ${newTime}`,
    });
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'alta':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          icon: <Zap className="w-4 h-4" />,
          text: 'URGENTE'
        };
      case 'media':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          icon: <Clock className="w-4 h-4" />,
          text: 'MEDIA'
        };
      case 'baja':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: <Timer className="w-4 h-4" />,
          text: 'NORMAL'
        };
      default:
        return {
          color: '',
          bg: 'bg-gray-100',
          icon: <Clock className="w-4 h-4" />,
          text: 'NORMAL'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(transfer.urgency);

  // Helper functions to get values with fallbacks
  const getVehicleBrand = () => transfer.brandVehicle || transfer.brand || '';
  const getVehicleModel = () => transfer.modelVehicle || transfer.model || '';
  const getVehicleYear = () => transfer.yearVehicle || transfer.year || '';
  const getVehiclePlate = () => transfer.patentVehicle || transfer.licensePlate || '';
  const getOriginAddress = () => transfer.startAddress?.address || transfer.originAddress || '';
  const getDestinationAddress = () => transfer.endAddress?.address || transfer.destinationAddress || '';
  const getOriginLat = () => (transfer as any)?.startAddress?.lat ?? null;
  const getOriginLng = () => (transfer as any)?.startAddress?.lng ?? null;
  const getDestLat = () => (transfer as any)?.endAddress?.lat ?? null;
  const getDestLng = () => (transfer as any)?.endAddress?.lng ?? null;
  const getTravelDate = () => transfer.travelDate || transfer.pickupDate || '';
  const getTravelTime = () => transfer.travelTime || transfer.pickupTime || '';
  const getDistance = () => transfer.distanceTravel || transfer.distance || 0;
  const getSenderName = () => transfer.personDelivery?.fullName || transfer.senderName || '';
  const getReceiverName = () => transfer.personReceive?.fullName || transfer.receiverName || '';

  console.log("transfer", transfer)

  return (
    <>
      <Card className="bg-white/10 overflow-hidden border-none shadow-none text-white text-left">
        <CardContent className="p-0">
          {/* Header simplificado - Solo ID y urgencia */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6EF7FF] rounded-full animate-pulse"></div>
                <h2 className="text-lg font-bold ">Traslado #{transfer?.id?.split('-')[1]}</h2>
                {transfer.isRescheduled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs font-medium">
                    <RotateCcw className="w-3 h-3" />
                    REPROGRAMADO
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${urgencyConfig.bg} ${urgencyConfig.color} text-xs font-bold text-black`}>
                {urgencyConfig.icon}
                {urgencyConfig.text}
              </div>
            </div>
          </div>

          {/* Precio destacado */}
          <div className="p-4 text-center bg-gradient-to-r from-[#6EF7FF]/5 to-transparent">
            <div className="flex items-center justify-center gap-2">
              <Euro className="w-6 h-6 " />
              <span className="text-3xl font-bold ">{transfer.totalPrice}</span>
              <span className="text-lg ">€</span>
            </div>
            <p className="text-xs  mt-1">Precio del traslado</p>
          </div>

          {/* Vehículo - Collapsible */}
          <Collapsible open={isVehicleOpen} onOpenChange={setIsVehicleOpen}>
            <CollapsibleTrigger className="w-full p-4 ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold ">{getVehicleBrand()} {getVehicleModel()}</p>
                    <p className="text-xs ">Información del vehículo</p>
                  </div>
                </div>
                {isVehicleOpen ?
                  <ChevronUp className="w-5 h-5 " /> :
                  <ChevronDown className="w-5 h-5 " />
                }
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 ">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-xs ">Año</p>
                    <p className="font-medium ">{getVehicleYear()}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-xs ">Matrícula</p>
                    <p className="font-medium ">{getVehiclePlate()}</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Ruta - ESTRUCTURA MÓVIL MEJORADA */}
          <Collapsible open={isRouteOpen} onOpenChange={setIsRouteOpen}>
            <CollapsibleTrigger className="w-full p-4  transition-colors border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Route className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold ">Ruta y Horarios</p>
                    <p className="text-xs ">{getDistance()} km • {Math.floor((transfer.duration || 0) / 60)}h {(transfer.duration || 0) % 60}min</p>
                  </div>
                </div>
                {isRouteOpen ?
                  <ChevronUp className="w-5 h-5 " /> :
                  <ChevronDown className="w-5 h-5 " />
                }
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 space-y-4 overflow-hidden">
                {/* Origen y Destino */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">ORIGEN</p>
                      <p className="text-sm ">{getOriginAddress()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                    <div>
                      <p className="text-xs text-red-600 font-medium">DESTINO</p>
                      <p className="text-sm ">{getDestinationAddress()}</p>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN DE FECHA Y BOTONES - LAYOUT COMPLETAMENTE VERTICAL */}
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#6EF7FF]" />
                    <p className="text-xs  font-medium">RECOGIDA PROGRAMADA</p>
                  </div>

              <div className="text-center mb-4">
                <p className="font-semibold  text-base leading-tight">
                  {formatDate(getTravelDate(), getTravelTime())}
                </p>
                    {transfer.isRescheduled && transfer.rescheduleReason && (
                      <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded">
                        Reprogramado por: {transfer.rescheduleReason}
                      </p>
                    )}
                  </div>

                  {/* BOTONES APILADOS VERTICALMENTE */}
                  <div className="space-y-3">
                    {/* Botón Reprogramar - Condicional según estado */}
                    {["pendiente", "asignado"].includes(transfer.status || "") && (
                      <div className="w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Reschedule button clicked');
                            setIsRescheduleModalOpen(true);
                          }}
                          className="w-full h-12 border-2 border-[#6EF7FF] text-[#6EF7FF] hover:bg-[#6EF7FF] hover:text-white font-medium rounded-xl transition-all duration-200 text-sm"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reprogramar
                        </Button>
                      </div>
                    )}

                    {/* Botón Ver Mapa - Siempre visible */}
                    <div className="w-full">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Map button clicked, current showMap:', showMap);
                          setShowMap(!showMap);
                        }}
                        className="w-full h-12 border-2 border-gray-300 hover:text-gray-700  font-medium rounded-xl transition-all duration-200 text-sm"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {showMap ? "Ocultar" : "Ver"} Mapa
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                {showMap && (
                  <div className="h-64 md:h-80 rounded-2xl overflow-hidden bg-white/5">
                    <GoogleMapComponent
                      originAddress={{
                        city: (transfer as any)?.startAddress?.city || getOriginAddress(),
                        lat: getOriginLat(),
                        lng: getOriginLng(),
                        address: getOriginAddress()
                      }}
                      destinationAddress={{
                        city: (transfer as any)?.endAddress?.city || getDestinationAddress(),
                        lat: getDestLat(),
                        lng: getDestLng(),
                        address: getDestinationAddress()
                      }}
                      isAddressesSelected={Boolean(getOriginAddress()) && Boolean(getDestinationAddress())}
                      droverMarkers={droverMarkers}
                    />
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Contactos - Collapsible */}
          <Collapsible open={isContactsOpen} onOpenChange={setIsContactsOpen}>
            <CollapsibleTrigger className="w-full p-4  transition-colors border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold ">Contactos</p>
                    <p className="text-xs ">Remitente y destinatario</p>
                  </div>
                </div>
                {isContactsOpen ?
                  <ChevronUp className="w-5 h-5 " /> :
                  <ChevronDown className="w-5 h-5 " />
                }
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3">
                <div className="grid gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-xs  mb-1">REMITENTE</p>
                    <p className="font-medium ">{getSenderName()}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-xs  mb-1">DESTINATARIO</p>
                    <p className="font-medium ">{getReceiverName()}</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Requisitos Especiales - Collapsible */}
          {transfer.specialRequirements && transfer.specialRequirements.length > 0 && (
            <Collapsible open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
              <CollapsibleTrigger className="w-full p-4  transition-colors border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold ">Requisitos Especiales</p>
                      <p className="text-xs ">{transfer.specialRequirements.length} requisito(s)</p>
                    </div>
                  </div>
                  {isRequirementsOpen ?
                    <ChevronUp className="w-5 h-5 " /> :
                    <ChevronDown className="w-5 h-5 " />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-2">
                  {transfer.specialRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
                      <Target className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <p className="text-sm ">{req}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Modal de reprogramación */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onConfirm={handleReschedule}
        currentDate={transfer.pickupDate || transfer.travelDate}
        currentTime={transfer.pickupTime || transfer.travelTime}
      />
    </>
  );
};

export default TransferDetailsCard;
