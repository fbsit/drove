import React, { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Trophy,
  AlertCircle,
  Check,
  Clipboard,
  FileText,
  CreditCard,
  Euro,
  Shield,
  Phone,
  Mail,
  UserCheck,
  Route,
  Star,
  Navigation,
  Award,
  Medal,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MobileAdminFab from "@/components/layout/MobileAdminFab";
import TransferViewerSheet from "@/components/layout/TransferViewerSheet";

// Mock data para demostración
const getMockTransfer = (id: string) => ({
  id: id,
  status: "DELIVERED",
  created_at: "2025-05-20T14:30:00Z",
  vehicleDetails: {
    type: "coche" as const,
    brand: "BMW",
    model: "X5",
    year: "2022",
    licensePlate: "1234-ABC",
    vin: "WBAFG1C50CDW12345",
  },
  pickupDetails: {
    originAddress: "Calle Gran Vía 123, Madrid, España",
    destinationAddress: "Avenida Diagonal 456, Barcelona, España",
    pickupDate: "2025-05-25",
    pickupTime: "10:00",
  },
  senderDetails: {
    fullName: "Juan Pérez",
    dni: "12345678A",
    email: "juan.perez@email.com",
    phone: "+34 600 123 456",
  },
  receiverDetails: {
    fullName: "María González",
    dni: "87654321B",
    email: "maria.gonzalez@email.com",
    phone: "+34 600 987 654",
  },
  transferDetails: {
    distance: 620,
    duration: 360,
    totalPrice: 380.5,
  },
  paymentMethod: "card" as const,
  client: {
    fullName: "Tech Solutions SL",
    email: "contacto@techsolutions.es",
    phone: "+34 900 123 456",
    type: "empresa",
  },
  drover: {
    fullName: "María García Rodríguez",
    email: "maria.garcia@drove.com",
    phone: "+34 600 789 123",
    rating: 4.9,
    completedTrips: 152,
    avatar: null,
  },
});

const getBadge = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 text-sm">
          <Trophy size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-green-400 font-bold whitespace-nowrap">
            Completado
          </span>
        </div>
      );
    case "PICKED_UP":
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30 text-sm">
          <Clock size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-blue-400 font-bold whitespace-nowrap">
            En progreso
          </span>
        </div>
      );
    case "CREATED":
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-sm">
          <Calendar size={16} className="text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-400 font-bold whitespace-nowrap">
            Pendiente
          </span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/10 border border-red-500/30 text-sm">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span className="text-red-400 font-bold whitespace-nowrap">
            Estado: {status}
          </span>
        </div>
      );
  }
};

const formatDate = (d: string) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const TransferViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showMap, setShowMap] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Referencias para scroll suave (ya no se usan pero las mantengo por compatibilidad)
  const vehicleRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const transfer = getMockTransfer(id || "transfer-123");

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
    setIsNavOpen(false);
  };

  const handleCopyId = () => {
    if (id) {
      navigator.clipboard
        .writeText(id)
        .then(() => {
          toast({
            title: "ID copiado",
            description:
              "El identificador del traslado ha sido copiado al portapapeles.",
          });
        })
        .catch(() => {
          toast({
            title: "Error al copiar",
            description: "No se pudo copiar el ID al portapapeles.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto pt-12">
        {/* Header móvil optimizado */}
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              className="rounded-2xl text-white hover:bg-white/10 flex-shrink-0"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span className="hidden xs:inline">Volver</span>
            </Button>
            <div className="flex-shrink-0">{getBadge(transfer.status)}</div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
              <div className="bg-[#6EF7FF]/20 p-2 rounded-xl flex-shrink-0">
                <Eye size={20} className="text-[#6EF7FF]" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">
                Traslado #{transfer.id.substring(0, 8)}
              </h1>
            </div>
            <p className="text-white/60 text-sm sm:text-base">
              Creado el {formatDate(transfer.created_at)}
            </p>
          </div>
        </div>

        {/* Stats Cards - Grid más responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Card Precio */}
          <Card className="bg-white/10 border-white/10">
            <CardContent className="p-3 sm:p-4 text-center gap-1">
              <div className="bg-white/40 p-2 sm:p-3 rounded-2xl w-fit mx-auto mb-2 sm:mb-3">
                <Euro size={18} className="text-[#6EF7FF]" />
              </div>
              <h3 className="text-white/80 font-bold text-xs sm:text-sm mb-1">
                Precio Total
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">
                €{transfer.transferDetails.totalPrice.toFixed(2)}
              </p>
              <p className="text-white/70 text-xs">IVA incluido</p>
            </CardContent>
          </Card>

          {/* Card Distancia */}
          <Card className="bg-white/10 border-white/10">
            <CardContent className="p-3 sm:p-4 text-center gap-1">
              <div className="bg-white/40 p-2 sm:p-3 rounded-2xl w-fit mx-auto mb-2 sm:mb-3">
                <Route size={18} className="text-[#6EF7FF]" />
              </div>
              <h3 className="text-white/80 font-bold text-xs sm:text-sm mb-1">
                Distancia
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {transfer.transferDetails.distance} km
              </p>
            </CardContent>
          </Card>

          {/* Card Duración */}
          <Card className="bg-white/10 border-white/10 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4 text-center gap-1">
              <div className="bg-white/40 p-2 sm:p-3 rounded-2xl w-fit mx-auto mb-2 sm:mb-3">
                <Clock size={18} className="text-[#6EF7FF]" />
              </div>
              <h3 className="text-white/80 font-bold text-xs sm:text-sm mb-1">
                Duración
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {Math.floor(transfer.transferDetails.duration / 60)}h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Vehículo Info */}
        <div ref={vehicleRef}>
          <Card className="bg-gradient-to-br from-white/10 to-white/20 border-white/20 backdrop-blur-sm mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/40 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                  <Car size={24} className="text-[#6EF7FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg sm:text-xl text-start">
                    Detalles del Vehículo
                  </h3>
                  <p className="text-white/90 text-sm">
                    Información completa del automóvil
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/80 rounded-2xl p-3 sm:p-4">
                  <p className="text-gray-800 text-xs sm:text-sm">
                    Marca y Modelo
                  </p>
                  <p className="text-gray-900 font-semibold text-sm sm:text-base">
                    {transfer.vehicleDetails.brand}{" "}
                    {transfer.vehicleDetails.model}
                  </p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 sm:p-4">
                  <p className="text-gray-800 text-xs sm:text-sm">Año</p>
                  <p className="text-gray-900 font-semibold text-sm sm:text-base">
                    {transfer.vehicleDetails.year}
                  </p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 sm:p-4">
                  <p className="text-gray-800 text-xs sm:text-sm">Matrícula</p>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">
                    {transfer.vehicleDetails.licensePlate}
                  </p>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 sm:p-4">
                  <p className="text-gray-800 text-xs sm:text-sm">VIN</p>
                  <p className="text-gray-900 font-semibold break-all text-sm">
                    {transfer.vehicleDetails.vin}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ruta y Mapa */}
        <div ref={routeRef}>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              {/* Header section - OPTIMIZADO PARA RESPONSIVE */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 ">
                <div className="flex items-center gap-3">
                  <div className="bg-white/40 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                    <Route size={24} className="text-[#6EF7FF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg text-start sm:text-xl">
                      Ruta del Traslado
                    </h3>
                    <p className="text-white/60 text-sm">
                      Origen y destino del vehículo
                    </p>
                  </div>
                </div>

                {/* Botón Ver Mapa - FULL WIDTH EN MÓVIL, NORMAL EN DESKTOP */}
                <div className="w-full sm:w-auto ">
                  <Button
                    variant="outline"
                    onClick={() => setShowMap(!showMap)}
                    className="w-full sm:w-auto rounded-2xl border-[#6EF7FF]/30 text-[#6EF7FF] hover:bg-[#6EF7FF]/10 text-sm"
                  >
                    {showMap ? "Ocultar" : "Ver"} Mapa
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="space-y-4 mb-4 lg:mb-0">
                  <div className="border border-white/20 rounded-lg h-1/2 p-2 flex items-start gap-3">
                    <div className="bg-green-500/20 p-2 rounded-lg mt-1 flex-shrink-0">
                      <Navigation size={14} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-sm">Origen</p>
                      <p className="text-white font-semibold text-sm sm:text-base break-words">
                        {transfer.pickupDetails.originAddress}
                      </p>
                      <p className="text-white/50 text-xs">Punto de recogida</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border border-white/20 rounded-lg h-1/2 p-2">
                    <div className="bg-red-500/20 p-2 rounded-lg mt-1 flex-shrink-0">
                      <MapPin size={14} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-sm">Destino</p>
                      <p className="text-white font-semibold text-sm sm:text-base break-words">
                        {transfer.pickupDetails.destinationAddress}
                      </p>
                      <p className="text-white/50 text-xs">Punto de entrega</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 h-full grid grid-rows-2">
                  <div className="bg-white/10 rounded-2xl p-3 sm:p-4 row-span-1">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-[#6EF7FF]" />
                      <span className="text-white/60 text-sm pt-1">
                        Fecha de recogida
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm sm:text-base">
                      {formatDate(transfer.pickupDetails.pickupDate)}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 sm:p-4 row-span-1 h-full">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[#6EF7FF]" />
                      <span className="text-white/60 text-sm">
                        Hora de recogida
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm sm:text-base">
                      {transfer.pickupDetails.pickupTime}
                    </p>
                  </div>
                </div>
              </div>

              {showMap && (
                <div className="h-48 sm:h-64 md:h-80 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="text-[#6EF7FF] mx-auto mb-4" />
                    <p className="text-white/60 text-sm sm:text-base">
                      Mapa de ruta (próximamente)
                    </p>
                    <p className="text-white/40 text-xs sm:text-sm">
                      Integración con Google Maps
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personas involucradas */}
        <div
          ref={peopleRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6"
        >
          {/* Remitente */}
          <Card className="bg-white/10 border-[#6EF7FF]/30 text-white/80">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/40 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                  <User size={20} className="text-[#6EF7FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm text-start sm:text-base">
                    Remitente
                  </h3>
                  <p className="text-xs sm:text-sm">Entrega el vehículo</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className=" font-semibold text-sm sm:text-base text-white">
                    {transfer.senderDetails.fullName}
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">
                    DNI: {transfer.senderDetails.dni}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="flex-shrink-0 text-[#6EF7FF]" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.senderDetails.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-[#6EF7FF] flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.senderDetails.email}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receptor */}
          <Card className="bg-white/10 border-[#6EF7FF]/30 text-white/80">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/40 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                  <UserCheck size={20} className="text-[#6EF7FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base text-start">
                    Receptor
                  </h3>
                  <p className="text-xs sm:text-sm">Recibe el vehículo</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {transfer.receiverDetails.fullName}
                  </p>
                  <p className="text-xs sm:text-sm">
                    DNI: {transfer.receiverDetails.dni}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-[#6EF7FF] flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.receiverDetails.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-[#6EF7FF] flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.receiverDetails.email}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card className="bg-white/10 border-[#6EF7FF]/30 text-white/80">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/40 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                  <Shield size={20} className="text-[#6EF7FF]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-start text-white">
                    Cliente
                  </h3>
                  <p className="text-xs sm:text-sm">
                    {transfer.client.type === "empresa"
                      ? "Empresa"
                      : "Particular"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {transfer.client.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-[#6EF7FF] flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.client.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-[#6EF7FF] flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.client.email}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drover */}
          <Card className="bg-white/10 border-[#6EF7FF]/30 text-white/80">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/40 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                  <Award size={20} className="text-[#6EF7FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base text-start">
                    Drover
                  </h3>
                  <p className="text-xs sm:text-sm">
                    Transportista profesional
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {transfer.drover.fullName}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= Math.floor(transfer.drover.rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-400"
                          }`}
                      />
                    ))}
                    <span className="text-xs sm:text-sm ml-2">
                      {transfer.drover.rating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-[#6EF7FF] flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">
                    {transfer.drover.phone}
                  </span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-semibold">
                  {transfer.drover.completedTrips} traslados completados
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalles de pago */}
        <div ref={paymentRef}>
          <Card className="bg-gradient-to-br from-white/10 to-green-900/20 border-green-500/20 backdrop-blur-sm mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="bg-green-500/20 p-2 sm:p-3 rounded-2xl flex-shrink-0">
                  <CreditCard size={24} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg sm:text-xl">
                    Detalles de Pago
                  </h3>
                  <p className="text-white/60 text-sm">
                    Información financiera del traslado
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 text-center">
                  <p className="text-white/60 text-xs sm:text-sm">Método</p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {transfer.paymentMethod === "card"
                      ? "Tarjeta"
                      : "Transferencia"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 text-center">
                  <p className="text-white/60 text-xs sm:text-sm">Subtotal</p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    €{(transfer.transferDetails.totalPrice * 0.79).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 sm:p-4 text-center">
                  <p className="text-white/60 text-xs sm:text-sm">IVA (21%)</p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    €{(transfer.transferDetails.totalPrice * 0.21).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-500/20 rounded-2xl p-3 sm:p-4 text-center border border-green-500/30">
                  <p className="text-white/60 text-xs sm:text-sm">Total</p>
                  <p className="text-green-400 text-lg sm:text-xl font-bold">
                    €{transfer.transferDetails.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-green-400">
                <Check size={16} />
                <span className="font-semibold text-sm sm:text-base">
                  Pago confirmado
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-20 md:mb-4">
          <Button
            variant="outline"
            className="rounded-2xl border-white/20 text-white hover:text-white hover:bg-white/10 text-sm"
          >
            <ArrowLeft size={14} className="mr-2" />
            Volver
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyId}
            className="rounded-2xl hover:bg-white/20 text-white hover:text-white text-sm border-white/20"
          >
            <Clipboard size={14} className="mr-2" />
            <span className="hidden sm:inline">Copiar ID</span>
            <span className="sm:hidden">ID</span>
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl border-white/20 text-white hover:bg-white/20 text-sm hover:text-white"
          >
            <FileText size={14} className="mr-2" />
            <span className="hidden sm:inline">Descargar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>

          <Button className="rounded-2xl bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold text-sm flex-1 sm:flex-none">
            <MapPin size={14} className="mr-2" />
            <span className="hidden sm:inline">Seguimiento en vivo</span>
            <span className="sm:hidden">Seguimiento</span>
          </Button>
        </div>

        {/* FAB de navegación móvil */}
        <div className="md:hidden">
          <MobileAdminFab onClick={() => setIsNavOpen(true)} />
        </div>

        {/* Sheet de navegación - ahora va a las rutas del sidebar */}
        <TransferViewerSheet
          open={isNavOpen}
          onOpenChange={setIsNavOpen}
          onNavigate={{
            vehicle: () => scrollToSection(vehicleRef),
            route: () => scrollToSection(routeRef),
            people: () => scrollToSection(peopleRef),
            payment: () => scrollToSection(paymentRef),
          }}
        />
      </div>
    </div>
  );
};

export default TransferViewer;