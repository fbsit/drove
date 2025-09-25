import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DroveButton } from "@/components/DroveButton";
import {
  Car,
  MapPin,
  Clock,
  Copy,
  Download,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Shield,
  CalendarClock,
  User,
  Package,
  Truck,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import TransferStepsBar, { getStatusLabel } from "@/components/trips/TransferStepsBar";
import GoogleMapComponent from "@/components/maps/GoogleMap";
import { useToast } from "@/hooks/use-toast";
import MobileFooterNav from "@/components/layout/MobileFooterNav";
import ReviewModal from "@/components/client/ReviewModal";

// Props interface para el componente móvil
interface MobileClientTripDetailProps {
  trip: any; // Usando any por ahora ya que estamos con simulaciones
}

// Función helper para formatear fechas
const formatFecha = (str: string) => {
  if (!str) return "";
  const date = new Date(str);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function MobileClientTripDetail({ trip }: MobileClientTripDetailProps) {
  const [showMap, setShowMap] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { toast } = useToast();

  const droverNameSafe = (
    trip?.drover?.full_name ||
    trip?.drover?.contactInfo?.fullName ||
    trip?.drover?.name ||
    'Drover'
  );
  const droverPhoneSafe = (
    trip?.drover?.telefono ||
    trip?.drover?.contactInfo?.phone ||
    (trip?.drover?.contactInfo?.phones?.[0]) ||
    '—'
  );
  const droverEmailSafe = (
    trip?.drover?.email ||
    trip?.drover?.contactInfo?.email ||
    '—'
  );

  // Helpers para distancia, duración y precio con tolerancia a tipos/ausencias
  const distanceKmSafe = (() => {
    const d = trip?.transfer_details?.distance ?? trip?.distanceTravel;
    const num = typeof d === 'string' ? parseFloat(d.toString().replace(/[^0-9,.]/g, '').replace(',', '.')) : Number(d);
    return isNaN(num) ? 0 : Math.round(num);
  })();

  const durationMinutesSafe = (() => {
    const d = trip?.transfer_details?.duration;
    if (typeof d === 'number' && isFinite(d)) return Math.max(0, Math.round(d));
    if (typeof d === 'string') {
      const parsed = parseInt(d, 10);
      if (!isNaN(parsed)) return parsed;
    }
    const t = trip?.timeTravel;
    if (typeof t === 'string' && t.includes(':')) {
      const [minsStr = '0'] = t.split(':');
      const mins = parseInt(minsStr, 10);
      return isNaN(mins) ? 0 : mins;
    }
    if (typeof t === 'number') return Math.max(0, Math.round(t));
    return 0;
  })();

  const priceTotalSafe = (() => {
    const p = trip?.transfer_details?.totalPrice ?? trip?.totalPrice ?? trip?.priceRoute;
    const num = typeof p === 'string' ? parseFloat(p.replace(/[^0-9,.]/g, '').replace(',', '.')) : Number(p);
    return isNaN(num) ? 0 : num;
  })();

  const handleCopyId = () => {
    navigator.clipboard.writeText(trip.id);
    toast({
      title: "ID copiado",
      description: `El ID ${trip.id} se ha copiado al portapapeles.`,
    });
  };

  const handleFacturaDownload = () => {
    toast({
      title: "Descarga iniciada",
      description: "Se está descargando la factura PDF.",
    });
  };

  const handleReviewSubmitted = (review: { rating: number; comment: string }) => {
    // Actualizar el trip con la nueva reseña
    trip.review = {
      id: "review-new",
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString()
    };

    toast({
      title: "Reseña enviada",
      description: "Tu reseña ha sido enviada correctamente.",
    });
  };

  const pagoTarjeta = trip.payment_method === "card";
  const isCompleted = trip.status === "completado";
  const canLeaveReview = isCompleted && !trip.review;

  return (
    <div
      className="min-h-screen bg-[#22142A]"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      {/* Barra de progreso móvil */}
      <div className="">
        <TransferStepsBar trip={trip} />
      </div>

      {/* Contenido principal móvil */}
      <div className="space-y-6 pb-20">

        {/* Banner de reprogramación móvil - rounded-xl aplicado */}
        {trip.isRescheduled && (
          <div className="bg-gradient-to-r from-amber-500/25 to-orange-500/15 border border-amber-400/40 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="bg-amber-400/30 p-2 rounded-xl shadow-md">
                <CalendarClock className="w-4 h-4 text-amber-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-amber-300 font-bold text-base mb-2 font-montserrat text-center">Traslado reprogramado</h3>
                <div className="space-y-2 text-white/90 text-xs">
                  <p className="leading-relaxed">
                    <span className="text-white/70 font-medium">Original:</span>{" "}
                    <span className="line-through text-red-300 font-semibold">
                      {formatFecha(trip.originalPickupDate!)} - {trip.originalPickupTime}
                    </span>
                  </p>
                  <p className="leading-relaxed">
                    <span className="text-white/70 font-medium">Nueva:</span>{" "}
                    <span className="text-[#6EF7FF] font-bold">
                      {formatFecha(trip.pickup_details.pickupDate)} - {trip.pickup_details.pickupTime}
                    </span>
                  </p>
                  {trip.rescheduleReason && (
                    <div className="mt-2 p-3 bg-white/15 rounded-xl shadow-sm border border-white/10">
                      <p className="text-xs text-white/60 mb-1 font-medium uppercase tracking-wide">Motivo:</p>
                      <p className="text-xs text-white leading-relaxed">{trip.rescheduleReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Título móvil */}
        <div className="text-center space-y-3 py-1">
          <h1 className="text-lg font-montserrat font-bold text-white leading-tight">
            Traslado <span className="text-[#6EF7FF] text-xl"># {trip.id}</span>
          </h1>
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6EF7FF]/15 text-[#6EF7FF] border border-[#6EF7FF]/30 shadow-md">
              <CheckCircle className="w-3 h-3 mr-1.5" />
              {getStatusLabel(trip.status)}
            </span>
            <span className="text-white/60 text-xs font-medium">
              Creado el {formatFecha(trip.createdAt || trip.created_at)}
            </span>
          </div>
        </div>

        {/* Bloque de Vehículo - rounded-xl aplicado */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 shadow-lg border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-[#6EF7FF]/20 p-1.5 rounded-xl">
              <Car className="text-[#6EF7FF]" size={16} />
            </div>
            <span className="font-montserrat font-bold text-white text-sm">Vehículo</span>
          </div>
          <div className="text-white font-montserrat font-bold text-lg mb-3 text-center">
            {(trip?.vehicle_details?.brand || trip?.brandVehicle || trip?.vehicle?.brand || '—')} {(trip?.vehicle_details?.model || trip?.modelVehicle || trip?.vehicle?.model || '')}
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-white/60 block mb-1 font-medium">Año</span>
              <span className="font-bold text-[#6EF7FF]">{trip?.vehicle_details?.year || trip?.yearVehicle || '—'}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-white/60 block mb-1 font-medium">Matrícula</span>
              <span className="font-bold text-[#6EF7FF]">{trip?.vehicle_details?.licensePlate || trip?.patentVehicle || trip?.licensePlate || '—'}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-white/60 block mb-1 font-medium">Estado</span>
              <span className="font-bold text-green-400">Asignado</span>
            </div>
          </div>
        </div>

        {/* Bloque de Precio - rounded-xl aplicado */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 shadow-lg border border-white/10">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-1.5 rounded-xl">
                <CreditCard className="text-green-400" size={16} />
              </div>
              <div>
                <span className="text-xs text-white/60 block">Precio total</span>
                  <span className="font-montserrat font-bold text-lg text-white">
                  €{priceTotalSafe.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-1 rounded-xl font-semibold ${pagoTarjeta ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                {pagoTarjeta ? "Pagado" : "Pendiente"}
              </span>
              <DroveButton
                variant="default"
                size="sm"
                className="mt-2 text-xs"
                onClick={handleFacturaDownload}
                icon={<Download className="w-3 h-3" />}
              >
                Factura
              </DroveButton>
            </div>
          </div>
        </div>

        {/* Bloque de Ruta del Traslado - rounded-xl aplicado */}
        <div className="bg-white/10 rounded-xl p-6 shadow-lg border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-[#6EF7FF]/20 p-1.5 rounded-xl">
              <MapPin className="text-[#6EF7FF]" size={16} />
            </div>
            <span className="font-montserrat font-bold text-white text-sm">Ruta del Traslado</span>
            {trip.isRescheduled && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30">
                <CalendarClock className="w-2.5 h-2.5" />
                NUEVA
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-white/5 rounded-xl p-4">
              <span className="font-montserrat font-bold text-[#6EF7FF] block mb-1">Origen:</span>
              <span className="text-white/90 leading-relaxed">{trip?.pickup_details?.originAddress || trip?.startAddress?.address || trip?.startAddress?.city || '—'}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="font-montserrat font-bold text-[#d95fef] block mb-1">Destino:</span>
              <span className="text-white/90 leading-relaxed">{trip?.pickup_details?.destinationAddress || trip?.endAddress?.address || trip?.endAddress?.city || '—'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-4 text-center shadow-md">
                <span className="text-xs text-white/60 block mb-1 font-medium">Distancia</span>
                <span className="font-bold text-[#6EF7FF] text-base">{distanceKmSafe} km</span>
              </div>
              <div className="bg-white/15 rounded-xl p-4 text-center shadow-md">
                <span className="text-xs text-white/60 block mb-1 font-medium">Duración</span>
                <span className="font-bold text-[#6EF7FF] text-base">
                  {Math.floor(durationMinutesSafe / 60)}h {durationMinutesSafe % 60}min
                </span>
              </div>
            </div>

            {/* Bloque de Recogida - rounded-xl aplicado */}
            <div className={`p-4 rounded-xl shadow-md ${trip.isRescheduled ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-white/10'}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#6EF7FF]" />
                <span className="text-white/70 text-xs font-bold uppercase tracking-wide">RECOGIDA</span>
                {trip.isRescheduled && (
                  <span className="text-amber-300 text-xs font-bold">(NUEVA)</span>
                )}
              </div>
              <div className="text-white font-bold text-sm text-center">
                {formatFecha(trip?.pickup_details?.pickupDate || trip?.travelDate)} - {(trip?.pickup_details?.pickupTime || trip?.travelTime || '--:--')}
              </div>
              {trip.isRescheduled && (
                <div className="mt-1 text-xs text-amber-300/80 font-medium text-center">
                  Original: {formatFecha(trip.originalPickupDate!)} - {trip.originalPickupTime}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <DroveButton
              variant="outline"
              size="sm"
              className="w-full font-bold"
              icon={<MapPin className="w-4 h-4" />}
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "Ocultar mapa" : "Ver mapa"}
            </DroveButton>

            {/* Botón de reseña en el módulo de ruta */}
            {canLeaveReview && (
              <DroveButton
                variant="default"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                icon={<Star className="w-4 h-4" />}
                className="w-full bg-gradient-to-r from-[#6EF7FF] to-[#FFD700] text-[#22142A] hover:from-[#32dfff] hover:to-[#FFC700] font-bold"
              >
                Dejar reseña del traslado
              </DroveButton>
            )}
          </div>

          {showMap && (
            <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
              <GoogleMapComponent
                originAddress={{
                  address: (trip?.pickup_details?.originAddress || trip?.startAddress?.address || trip?.startAddress?.city || ''),
                  city: (trip?.startAddress?.city || trip?.pickup_details?.originAddress || ''),
                  lat: trip?.startAddress?.lat ?? 40.4168,
                  lng: trip?.startAddress?.lng ?? -3.7038,
                }}
                destinationAddress={{
                  address: (trip?.pickup_details?.destinationAddress || trip?.endAddress?.address || trip?.endAddress?.city || ''),
                  city: (trip?.endAddress?.city || trip?.pickup_details?.destinationAddress || ''),
                  lat: trip?.endAddress?.lat ?? 41.3879,
                  lng: trip?.endAddress?.lng ?? 2.16992,
                }}
                isAddressesSelected={Boolean((trip?.startAddress || trip?.pickup_details) && (trip?.endAddress || trip?.pickup_details))}
              />
            </div>
          )}
        </div>

        {/* Bloques de personas - rounded-xl aplicado */}
        <div className="space-y-4">

          {/* Bloque de Remitente - rounded-xl aplicado */}
          <div className="bg-[#cdc6d6]/90 rounded-xl p-5 shadow-lg border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <User className="text-[#22142A]" size={16} />
              <span className="text-[#22142A] font-montserrat font-bold text-sm">Remitente</span>
            </div>
            <div className="bg-white/30 rounded-xl p-4">
              <div className="text-[#22142A] font-montserrat font-bold text-base mb-1 text-center">{trip?.sender?.name || trip?.personDelivery?.fullName || '—'}</div>
              <div className="text-[#22142A]/80 text-sm font-semibold mb-2 text-center">{trip?.sender?.dni || trip?.personDelivery?.dni || '—'}</div>
              <div className="text-[#22142A]/70 text-xs space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{trip?.sender?.email || trip?.personDelivery?.email || '—'}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{trip?.sender?.phone || trip?.personDelivery?.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bloque de Drover asignado - rounded-xl aplicado */}
          <div className="bg-[#cdc6d6]/90 rounded-xl p-5 shadow-lg border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Truck className="text-[#22142A]" size={16} />
              <span className="text-[#22142A] font-montserrat font-bold text-sm">Drover asignado</span>
            </div>
            <div className="flex items-center gap-3 bg-white/30 rounded-xl p-4">
              <div className="bg-[#b5eaff] text-[#22142A] rounded-xl w-12 h-12 flex items-center justify-center font-montserrat font-bold text-lg shadow-lg border-2 border-white mx-auto">
                {(droverNameSafe || 'D').toString().slice(0,1)}
              </div>
              <div className="flex-1 text-center">
                <div className="text-[#22142A] font-montserrat font-bold text-base mb-0.5">{droverNameSafe}</div>
                <div className="text-[#22142A]/80 text-sm font-semibold mb-0.5">{droverPhoneSafe}</div>
                <div className="text-[#22142A]/70 text-xs">{droverEmailSafe}</div>
              </div>
            </div>
          </div>

          {/* Bloque de Receptor - rounded-xl aplicado */}
          <div className="bg-[#cdc6d6]/90 rounded-xl p-5 shadow-lg border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Package className="text-[#22142A]" size={16} />
              <span className="text-[#22142A] font-montserrat font-bold text-sm">Receptor</span>
            </div>
            <div className="bg-white/30 rounded-xl p-4">
              <div className="text-[#22142A] font-montserrat font-bold text-base mb-1 text-center">{trip?.receiver?.name || trip?.personReceive?.fullName || '—'}</div>
              <div className="text-[#22142A]/80 text-sm font-semibold mb-2 text-center">{trip?.receiver?.dni || trip?.personReceive?.dni || '—'}</div>
              <div className="text-[#22142A]/70 text-xs space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{trip?.receiver?.email || trip?.personReceive?.email || '—'}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{trip?.receiver?.phone || trip?.personReceive?.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción móviles */}
        <div className="space-y-3">
          <Link to="/cliente/traslados" className="block">
            <DroveButton
              variant="outline"
              size="lg"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="w-full font-bold"
            >
              Volver a traslados
            </DroveButton>
          </Link>
          <DroveButton
            variant="accent"
            size="lg"
            onClick={handleCopyId}
            icon={<Copy className="w-4 h-4" />}
            className="w-full font-bold"
          >
            Copiar ID #{trip.id}
          </DroveButton>
          <DroveButton
            variant="default"
            size="lg"
            icon={<Download className="w-4 h-4" />}
            onClick={handleFacturaDownload}
            className="w-full font-bold"
          >
            Descargar PDF
          </DroveButton>
        </div>
      </div>

      <MobileFooterNav />

      {/* Modal de reseña */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        transferId={trip.id}
        droverName={(trip?.drover?.full_name || trip?.drover?.contactInfo?.fullName || trip?.drover?.name || 'Drover')}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
