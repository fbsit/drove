import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DroveButton } from "@/components/DroveButton";
import { useParams } from "react-router-dom";
import {
  Car,
  Star,
  User,
  CheckCircle,
  CreditCard,
  Shield,
  CalendarClock,
  MapPin,
  Clock,
  Copy,
  Download,
  ArrowLeft,
} from "lucide-react";
import TransferStepsBar, { getStatusLabel } from "@/components/trips/TransferStepsBar";;
import GoogleMapComponent from "@/components/maps/GoogleMap";
import { useToast } from "@/hooks/use-toast";
import MobileFooterNav from "@/components/layout/MobileFooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileClientTripDetail from "@/components/client/MobileClientTripDetail";
import ReviewModal from "@/components/client/ReviewModal";
import { TransferService } from '@/services/transferService';
import { formatDateOnlyEs } from '@/utils/datetime';

function glassCardClass(tone: "default" | "blue" | "green" | "purple" = "default") {
  switch (tone) {
    case "blue":
      return "bg-gradient-to-br from-[#e8f7ff]/70 to-[#b9e2f7]/70";
    case "green":
      return "bg-gradient-to-br from-[#e9fff1]/90 to-[#baffd3]/60";
    case "purple":
      return "bg-gradient-to-br from-[#f2e9fa]/80 to-[#e6e6fa]/40";
    default:
      return "bg-white/10";
  }
}

// Fecha formateada tipo español, respetando YYYY-MM-DD como fecha local
const formatFecha = (str: string) => formatDateOnlyEs(str);

const formatFechaHora = (str: string) => {
  if (!str) return "";
  const date = new Date(str);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function ClientTripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    handleGetTravel();
    const timeout = setTimeout(() => {
      if (loading) setErrorMsg('Estamos preparando tu traslado. Esto puede tardar unos segundos.');
    }, 8000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGetTravel = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const travel = await TransferService.getTransferById(id);
      // si el backend devuelve 201/202 o un objeto parcial, forzamos render mínimo
      setTrip(travel ?? {});
      setErrorMsg("");
    } catch (e: any) {
      setErrorMsg('No pudimos cargar el traslado. Intenta recargar o vuelve atrás.');
    } finally {
      setLoading(false);
    }
  }

  // Copiar el ID al portapapeles
  const handleCopyId = () => {
    navigator.clipboard.writeText(trip.id);
    toast({
      title: "ID copiado",
      description: `El ID ${trip.id} se ha copiado al portapapeles.`,
    });
  };

  const handleFacturaDownload = () => {
    const url = trip?.invoice?.urlPDF;
    if (!url) {
      console.warn('No hay URL de factura disponible');
      return;
    }

    // Crea un enlace dinámico para forzar la descarga
    const link = document.createElement('a');
    link.target = '_blank'; // Abre en una nueva pestaña
    link.href = url;
    // Pones el nombre que quieras darle al archivo descargado
    // Si el servidor ya envía Content-Disposition, puede no ser necesario
    link.download = url.split('/').pop() || 'factura.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReviewSubmitted = (review: { rating: number; comment: string }) => {
    // Crear reseña simple compatible con el tipo esperado
    setTrip(prev => ({
      ...prev,
      review: {
        id: "review-new",
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString()
      }
    }));

    toast({
      title: "Reseña enviada",
      description: "Tu reseña ha sido enviada correctamente.",
    });
  };

  const pagoTarjeta = trip?.payment_method === "card";
  const isCompleted = trip?.status === "completado";
  const canLeaveReview = isCompleted && !trip?.review;

  const statusInfo = {
    PENDINGPAID: { label: 'Pendiente de pago', hint: 'Abona el viaje para continuar', color: '#d97706' },
    CREATED: { label: 'Creado', hint: 'Buscando conductor', color: '#5f39bd' },
    ASSIGNED: { label: 'Asignado', hint: 'Conductor asignado', color: '#2563eb' },
    PICKED_UP: { label: 'Retirado', hint: 'Paquete retirado', color: '#2563eb' },
    IN_PROGRESS: { label: 'En curso', hint: 'En camino al destino', color: '#2563eb' },
    REQUEST_FINISH: { label: 'Fin solicitado', hint: 'Conductor solicitó finalizar', color: '#2563eb' },
    DELIVERED: { label: 'Entregado', hint: 'Entrega completada', color: '#16a34a' },
    CANCELLED: { label: 'Cancelado', hint: 'Viaje anulado', color: '#dc2626' },
  };

  if (loading && !trip) {
    return (
      <DashboardLayout pageTitle={`Traslado #${trip?.id}`}>
        <div className="flex flex-col items-center justify-center h-64 text-white/80">
          Cargando traslado...
        </div>
      </DashboardLayout>
    )
  }

  if (!trip || Object.keys(trip).length === 0) {
    return (
      <DashboardLayout pageTitle="Traslado">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <div className="text-white/80">{errorMsg || 'No pudimos cargar el traslado.'}</div>
          <div className="flex gap-2">
            <button onClick={handleGetTravel} className="px-4 py-2 rounded-2xl bg-[#6EF7FF] text-[#22142A] font-bold">Reintentar</button>
            <Link to="/cliente/traslados" className="px-4 py-2 rounded-2xl bg-white/10 text-white border border-white/20">Volver</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Si es móvil, renderizar la versión móvil
  if (isMobile) {
    return <MobileClientTripDetail trip={trip} />;
  }

  const { label, hint, color } = statusInfo[trip.status] || { label: trip.status, hint: '', color: '#5f39bd' };

  // Versión desktop (mantener exactamente igual)
  return (
    <DashboardLayout pageTitle={`Traslado #${trip?.id}`}>
      {/* CONTENEDOR PRINCIPAL CON CENTRADO CORRECTO */}
      <div className="w-full min-h-screen bg-[#22142A]">
        {/* Barra gamificada de progreso */}
        <div className="">
          <TransferStepsBar trip={trip} />
        </div>

        {/* CONTENIDO PRINCIPAL CENTRADO */}
        <div className="w-full space-y-6 md:space-y-10">
          {/* Banner de reprogramación */}
          {trip.isRescheduled && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500/20 p-3 rounded-full">
                  <CalendarClock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-400 font-bold text-lg mb-2">Traslado reprogramado</h3>
                  <div className="space-y-2 text-white/90">
                    <p className="text-sm">
                      <span className="text-white/60">Fecha original:</span>{" "}
                      <span className="line-through text-red-400">
                        {formatFecha(trip.pickup_details.pickupDate)} a las {trip.pickup_details.pickupTime}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-white/60">Nueva fecha:</span>{" "}
                      <span className="text-[#6EF7FF] font-bold">
                        {formatFecha(trip.pickup_details.pickupDate)} a las {trip.pickup_details.pickupTime}
                      </span>
                    </p>
                    {trip.rescheduleReason && (
                      <div className="mt-3 p-3 bg-white/10 rounded-xl">
                        <p className="text-xs text-white/60 mb-1">Motivo:</p>
                        <p className="text-sm text-white">{trip.rescheduleReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-amber-400/60 hidden md:block">
                  Reprogramado el {formatFecha(trip.rescheduledAt!)}
                </div>
              </div>
            </div>
          )}

          {/* Título principal + estado */}
          <section className="flex flex-col items-center text-center space-y-3 md:space-y-2 md:flex-row md:items-center md:justify-between md:text-left">
            <div className="w-full md:w-auto flex flex-col items-center md:items-start">
              <h1 className="text-xl md:text-4xl font-montserrat font-bold text-white tracking-wide text-center md:text-left leading-tight">
                Traslado <span className="text-[#6EF7FF] font-montserrat font-bold">#{trip.id}</span>
              </h1>
              <div className="mt-3 md:mt-2 flex flex-col md:flex-row items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-[#6EF7FF]/10 text-[#6EF7FF] font-montserrat">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {getStatusLabel(trip.status)}
                </span>
                <span className="text-white/60 text-sm font-montserrat">
                  Creado el {formatFecha(trip.createdAt || trip.created_at)}
                </span>
              </div>
            </div>
          </section>

          {/* Resumen cards: Vehículo, Precio, Estado */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white/90 rounded-2xl gap-4 flex flex-col shadow-xl p-6 ">
              <div className="flex items-center justify-center gap-3">
                <Car className="text-[#22142A]" size={25} />
                <span className="text-lg font-montserrat font-bold text-[#22142A]">Vehículo</span>
              </div>
              <div className="text-[#22142A] font-montserrat font-bold text-xl ">
                {trip?.brandVehicle} {trip?.modelVehicle}
              </div>
              <div className="text-[#22142A] flex-1 flex flex-col gap-4 mt-auto text-sm justify-end text-left">
                <div className="flex items-center justify-between">
                  <dt>Marca y Modelo:</dt>
                  <dd className="font-semibold">{trip?.brandVehicle} {trip?.modelVehicle}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Año:</dt>
                  <dd className="font-semibold">{trip?.yearVehicle}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Matrícula:</dt>
                  <dd>
                    <span className="font-bold">{trip?.patentVehicle}</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between flex-wrap">
                  <dt>VIN:</dt>
                  <dd><span className="font-mono tsext-xs">{trip?.bastidor}</span></dd>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center bg-white/90"

            >
              <div className="flex items-center gap-2">
                <CreditCard style={{ color: "#1264a3" }} size={22} />
                <span className="font-montserrat font-semibold text-lg" style={{ color: "#1264a3" }}>
                  Precio del traslado
                </span>
              </div>
              <div
                className="font-montserrat font-bold text-xl md:text-3xl mt-2"
                style={{ color: "#0A2B4B" }}
              >
                €{trip?.totalPrice.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-center font-montserrat" style={{ color: "#1264a3" }}>
                Este es el precio total a abonar por el servicio.
              </div>

              <div className="flex flex-col gap-1 mt-4 items-center">
                <span className={`text-xs font-montserrat p-3 rounded-[100px] ${pagoTarjeta ? "text-green-200" : "text-red-400"}`}>
                  Estado de pago: {trip.status === 'PAID' ? "Pagado" : "Pendiente de pago"}
                </span>
                <button
                  className="mt-2 bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-montserrat font-bold rounded-2xl px-4 py-2 text-sm transition-colors shadow"
                  onClick={handleFacturaDownload}
                >
                  Descargar factura
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl shadow-xl p-6 flex flex-col items-center justify-between text-center bg-white/90"
            >
              <div className="flex items-center gap-2">
                <Shield style={{ color }} size={22} />
                <span className="font-montserrat font-semibold text-lg" style={{ color }}>
                  Estado
                </span>
              </div>

              <div className="font-montserrat font-bold text-2xl mt-2" style={{ color }}>
                {label}
              </div>

              {hint && (
                <div className="text-xs font-montserrat" style={{ color }}>
                  {hint}
                </div>
              )}
            </div>
          </section>

          {/* Ruta del traslado con indicador de reprogramación */}
          <section className={"rounded-2xl shadow-xl p-6 " + glassCardClass()}>
            <div className="flex flex-col space-y-4">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <MapPin className="text-[#6EF7FF]" size={20} />
                  <span className="font-montserrat font-bold text-white text-lg">Ruta del Traslado</span>
                  {trip.isRescheduled && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                      <CalendarClock className="w-3 h-3" />
                      FECHA ACTUALIZADA
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 text-center md:text-left">
                  <div className="font-montserrat">
                    <span className="font-montserrat font-bold text-[#6EF7FF] block md:inline">Origen:</span>
                    <span className="text-white block md:inline md:ml-2">{trip?.startAddress?.address}</span>
                  </div>
                  <div className="font-montserrat">
                    <span className="font-montserrat font-bold text-[#d95fef] block md:inline">Destino:</span>
                    <span className="text-white block md:inline md:ml-2">{trip?.endAddress?.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                    <div className="bg-white/10 rounded-xl px-4 py-3 flex flex-col items-center">
                      <span className="text-lg text-white/60 font-montserrat">Distancia</span>
                      <span className="font-bold text-[#6EF7FF] text-lg font-montserrat">{trip?.distanceTravel} km</span>
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-3 flex flex-col items-center">
                      <span className="text-lg text-white/60 font-montserrat">Duración</span>
                      <span className="font-bold text-[#6EF7FF] text-lg font-montserrat">
                        {trip?.travelTime} horas
                      </span>
                    </div>
                    {/* Información de recogida con indicador de reprogramación */}
                    <div className={`px-4 py-3 rounded-xl ${trip?.isRescheduled ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/10'}`}>
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Clock className="w-5 h-5 text-[#6EF7FF]" />
                        <span className="text-white/60 text-lg font-montserrat ">RECOGIDA PROGRAMADA</span>
                        {trip?.isRescheduled && (
                          <span className="text-amber-400 text-xs font-medium">(ACTUALIZADA)</span>
                        )}
                      </div>
                      <div className="font-bold text-[#6EF7FF] text-lg font-montserrat">
                        {formatFecha(trip?.travelDate)} a las {trip?.travelTime ?? '--:--'}
                      </div>
                      {trip?.isRescheduled && (
                        <div className="mt-2 text-xs text-amber-400 text-center md:text-left">
                          Fecha original: {formatFecha(trip?.originalPickupDate!)} a las {trip?.originalPickupTime}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start items-center">
                  <DroveButton
                    variant="outline"
                    size="sm"
                    className="font-montserrat w-full sm:w-auto"
                    icon={<MapPin className="w-4 h-4 mr-1" />}
                    onClick={() => setShowMap(!showMap)}
                  >
                    {showMap ? "Ocultar mapa" : "Ver mapa"}
                  </DroveButton>
                </div>
              </div>
            </div>

            {showMap && (
              <div className="mt-6">
                <GoogleMapComponent
                  originAddress={{
                    city: trip.startAddress.city,
                    lat: trip?.startAddress?.lat,
                    lng: trip?.startAddress?.lng,
                  }}
                  destinationAddress={{
                    city: trip.endAddress.city,
                    lat: trip?.endAddress?.lat,
                    lng: trip?.endAddress?.lng,
                  }}
                  isAddressesSelected={true}
                />
              </div>
            )}
          </section>

          {/* Remitente / DROVER / Receptor cards */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/90 shadow p-6 flex flex-col items-center justify-between border-none min-h-[220px] text-center">
              <span className="text-[#22142A] text-lg font-montserrat font-bold mb-3">Remitente</span>
              <hr className="w-full border-[#22142A]/20 mb-3" />
              <div className="text-[#22142A] font-montserrat font-bold md:text-xl mb-2">{trip?.personDelivery?.fullName}</div>
              <div className="text-[#22142A]/80 text-base font-montserrat mb-2">{trip?.personDelivery?.dni}</div>
              <div className="flex flex-col text-sm text-[#22142A]/70 font-montserrat gap-1">
                <span>{trip?.personDelivery?.email}</span>
                <span>{trip?.personDelivery?.phone}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 shadow p-6 flex flex-col items-center justify-center border-none min-h-[220px]">
              <span className="text-[#22142A] text-lg font-montserrat font-bold mb-3">Drover asignado</span>
              <hr className="w-full border-[#22142A]/20 mb-3" />
              <div className="flex flex-col items-center w-full gap-2">
                <div className="bg-[#b5eaff] text-[#22142A] rounded-full w-14 h-14 flex items-center justify-center font-montserrat font-bold text-2xl mb-2">
                  {trip?.drover?.contactInfo?.fullName ?? "Drover"}
                </div>
                <div className="text-[#22142A] font-montserrat font-bold md:text-xl text-center">{trip?.drover?.contactInfo?.fullName}</div>
                <div className="text-[#22142A]/80 text-base font-montserrat text-center">{trip?.drover?.contactInfo.phone || trip?.drover?.contactInfo.phones[0]}</div>
                <div className="text-[#22142A]/70 text-sm font-montserrat text-center">{trip?.drover?.email}</div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 shadow p-6 flex flex-col items-center justify-between border-none min-h-[220px] text-center">
              <span className="text-[#22142A] text-lg font-montserrat font-bold mb-2">Receptor</span>
              <hr className="w-full border-[#22142A]/20 mb-3" />
              <div className="text-[#22142A] font-montserrat font-bold md:text-xl mb-2">{trip?.personReceive?.fullName}</div>
              <div className="text-[#22142A]/80 text-base font-montserrat mb-2">{trip?.personReceive?.dni}</div>
              <div className="flex flex-col text-sm text-[#22142A]/70 font-montserrat gap-1">
                <span>{trip?.personReceive?.email}</span>
                <span>{trip?.personReceive?.phone}</span>
              </div>
            </div>
          </section>

          {/* Sección de reseña */}
          {trip?.review ? (
            <section className="rounded-2xl bg-white/10 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Star className="text-yellow-400" size={24} />
                <h3 className="font-montserrat font-bold text-white text-xl">Tu reseña</h3>
              </div>

              {/* Reseña del cliente */}
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= trip.review!.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-sm">
                    {formatFechaHora(trip.review.createdAt)}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  {trip.review.comment}
                </p>
              </div>

              {/* Respuesta del drover */}
              {trip.review.droverResponse && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-semibold text-sm">
                      Respuesta de {trip.drover.full_name}
                    </span>
                    <span className="text-white/60 text-xs">
                      {formatFechaHora(trip.review.droverResponseDate!)}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {trip.review.droverResponse}
                  </p>
                </div>
              )}

              {/* Respuesta del admin */}
              {trip.review.adminResponse && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-semibold text-sm">
                      Respuesta del equipo DROVE
                    </span>
                    <span className="text-white/60 text-xs">
                      {formatFechaHora(trip.review.adminResponseDate!)}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {trip.review.adminResponse}
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {/* Botones de acción - ARREGLADO: mejor grid para evitar que se corten */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center items-center">
            <Link to="/cliente/traslados" className="w-full">
              <DroveButton variant="outline" size="lg" icon={<ArrowLeft />} className="w-full">
                Volver a traslados
              </DroveButton>
            </Link>
            <DroveButton
              variant="accent"
              size="lg"
              onClick={handleCopyId}
              icon={<Copy />}
              className="w-full"
            >
              Copiar ID
            </DroveButton>
            {trip?.invoice?.urlPDF && (
              <DroveButton variant="default" size="lg" icon={<Download />} onClick={handleFacturaDownload} className="w-full">
                Ver PDF Factura
              </DroveButton>
            )}

            {/* Botón de reseña - ARREGLADO: ahora en el grid */}
            {canLeaveReview && (
              <DroveButton
                variant="default"
                size="lg"
                onClick={() => setIsReviewModalOpen(true)}
                icon={<Star />}
                className="w-full bg-gradient-to-r from-[#6EF7FF] to-[#FFD700] text-[#22142A] hover:from-[#32dfff] hover:to-[#FFC700]"
              >
                Dejar reseña
              </DroveButton>
            )}
          </div>
        </div>

        <MobileFooterNav />
      </div>

      {/* Modal de reseña */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        transferId={trip?.id}
        droverName={trip?.drover?.full_name}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </DashboardLayout>
  );
}
