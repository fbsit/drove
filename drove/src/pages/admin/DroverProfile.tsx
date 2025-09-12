import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Building2,
  Award,
  Star,
  TrendingUp,
  Euro,
  Clock,
  Activity,
  BadgeCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import userService from "@/services/userService";
import { AdminService } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";

const estadoColors = {
  APPROVED: "bg-emerald-600 text-white",
  PENDING: "bg-amber-500 text-white",
  REJECTED: "bg-rose-700 text-white",
};

const estadoLabels = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
};

const tipoBadge = (tipo) => (
  <span
    className={`flex rounded-full px-2.5 py-1 text-xs font-semibold ml-1 ${tipo === "drover_core"
      ? "bg-[#2c76b8] text-white flex items-center gap-1"
      : "bg-[#6ef7ff] text-[#22142A]"
      }`}
    style={{ fontFamily: "Helvetica" }}
  >
    {tipo === "drover_core" ? (
      <>
        <Building2 size={13} className="mr-1" />
        Drover Core
      </>
    ) : (
      <>
        <User size={13} className="mr-1" />
        Drover Flex
      </>
    )}
  </span>
);

const DroverProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleGetUser = async () => {
    const droverInfo = await userService.getUserForAdmin(id);
    console.log("droverInfo", droverInfo);
    setDrover(droverInfo);
  };

  // Buscar el drover por id
  useEffect(() => {
    handleGetUser();
  }, []);

  const [drover, setDrover] = useState(null);

  if (!drover) {
    return (
      <div className="p-8 text-white">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} className="mr-2" /> Volver
        </Button>
        <div className="mt-16 text-center text-xl">Drover no encontrado</div>
      </div>
    );
  }

  // Acciones aprobar/rechazar
  const handleApproved = async () => {
    const result = await AdminService.approveUser(drover.id);
    if (result) {
      toast({
        title: "Usuario aprobado",
        description: "El drover ha sido aprobado exitosamente.",
      });
      handleGetUser();
    }
  };

  const handleRejected = async () => {
    const result = await AdminService.rejectUser(drover.id);
    if (result) {
      toast({
        title: "Usuario rechazado",
        description: "El drover ha sido rechazado exitosamente.",
      });
      handleGetUser();
    }
  };

  const handleHire = async () => {
    // Acción placeholder: en el futuro conectar con flujo de contratación
    toast({
      title: "Contratación",
      description: "Se inició el proceso de contratación para este drover.",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top actions bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 xs:px-4 md:px-0 gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="rounded-xl border-2 border-white/20 bg-transparent text-[#6EF7FF] hover:bg-[#6EF7FF] hover:text-[#22142A] h-10 px-6 py-2"
        >
          <ArrowLeft size={16} className="mr-2" /> Volver a Drovers
        </Button>
        <div className="flex items-center gap-2">
          {drover?.role !== "drover_core" && (
            <Button
              onClick={handleHire}
              variant="outline"
              className="rounded-xl bg-green-700 text-white hover:text-green-900 hover:bg-green-200 font-bold h-10 px-6 py-2"
            >
              <ShieldCheck size={16} className="mr-2" /> Contratar
            </Button>
          )}
          {(drover.status === "PENDING" || drover.status === "REJECTED") && (
            <Button
              onClick={handleApproved}
              className="rounded-2xl border border-cyan-400/40 bg-transparent text-cyan-300 hover:bg-cyan-400/10"
            >
              <BadgeCheck size={16} className="mr-2" /> Aprobar
            </Button>
          )}
          {(drover.status === "PENDING" || drover.status === "APPROVED") && (
            <Button
              onClick={handleRejected}
              variant="destructive"
              className="rounded-2xl"
            >
              <UserX size={16} className="mr-2" /> Rechazar
            </Button>
          )}
        </div>
      </div>
      {/* Header card */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-[#2B2540] px-3 xs:px-4 md:px-8 py-5 md:py-7 rounded-2xl shadow-lg border border-white/10">
        {/* Avatar */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-[#6ef7ff]/90 shadow-md border-4 border-white overflow-hidden text-2xl md:text-3xl font-bold uppercase text-[#22142A]">
          {drover?.contactInfo?.selfie || drover?.avatar || drover?.selfie ? (
            <img
              src={
                drover?.contactInfo?.selfie || drover?.avatar || drover?.selfie
              }
              alt={drover.contactInfo?.fullName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            drover.contactInfo?.fullName?.charAt(0)
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap gap-2 items-center mb-1 text-start">
            <h1
              className="text-lg xs:text-xl md:text-2xl text-white font-bold break-words w-full"
              style={{ fontFamily: "Helvetica" }}
            >
              {drover?.contactInfo?.fullName}
            </h1>
            {tipoBadge(drover.role)}
            <span
              className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm ${estadoColors[drover.status] || "bg-zinc-700 text-white"
                }`}
            >
              {estadoLabels[drover.status] || drover.status}
            </span>
            <span className="px-3 py-1 rounded-full font-semibold text-xs md:text-sm bg-white/10 text-white">
              Nivel 3
            </span>
          </div>
          <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 items-start xs:items-center mt-2 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Mail size={15} className="inline mr-1 opacity-70" />
              <span>{drover.email}</span>
            </div>
            <span className="hidden xs:block mx-2">|</span>
            <div className="flex items-center gap-1">
              <Phone size={15} className="inline mr-1 opacity-70" />
              <span>{drover.contactInfo?.phone || "—"}</span>
            </div>
          </div>
        </div>
        {/* Acciones rápidas eliminadas */}
        <div className="hidden"></div>
      </div>

      {/* KPIs (estilo con iconos y colores) */}
      <div className="px-3 xs:px-4 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
              <Euro size={24} className="text-emerald-600" />
            </div>
            <div className="text-white font-bold text-sm mb-1">
              Ganancias totales
            </div>
            <div className="text-2xl font-bold text-white">€0</div>
            <div className="text-white/70 text-xs mt-1">desde alta</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <div className="text-white font-bold text-sm mb-1">
              Promedio mensual
            </div>
            <div className="text-2xl font-bold text-white">€0</div>
            <div className="text-white/70 text-xs mt-1">0 meses</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
              <Star size={24} className="text-yellow-600" />
            </div>
            <div className="text-white font-bold text-sm mb-1">
              Calificación
            </div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-white/70 text-xs mt-1">de 5 estrellas</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
              <Activity size={24} className="text-purple-600" />
            </div>
            <div className="text-white font-bold text-sm mb-1">Traslados</div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-white/70 text-xs mt-1">completados</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
              <Clock size={24} className="text-sky-600" />
            </div>
            <div className="text-white font-bold text-sm mb-1">
              Tiempo promedio
            </div>
            <div className="text-2xl font-bold text-white">N/A</div>
            <div className="text-white/70 text-xs mt-1">por traslado</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
              <Award size={24} className="text-orange-600" />
            </div>
            <div className="text-white font-bold text-sm mb-1">Medallas</div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-white/70 text-xs mt-1">logros</div>
          </div>
        </div>
      </div>

      {/* Datos personales - Disclosure */}
      <div className="rounded-2xl border border-white/10 bg-[#22142A]">
        <Accordion type="single" collapsible defaultValue="personal">
          <AccordionItem value="personal" className="border-none">
            <AccordionTrigger className="px-3 xs:px-4 md:px-8 py-4 md:py-5 no-underline">
              <div className="flex items-center gap-3">
                <div className="bg-[#6EF7FF]/20 p-2.5 rounded-xl">
                  <User size={18} className="text-[#6EF7FF]" />
                </div>
                <span
                  className="text-white font-semibold text-base md:text-lg"
                  style={{ fontFamily: "Helvetica" }}
                >
                  Datos Personales
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 xs:px-4 md:px-8 pb-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-white/90 text-sm md:text-base text-center">
                <div>
                  <div className="text-white/70">Nombre:</div>
                  <div className="font-semibold">
                    {drover.contactInfo?.fullName}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">Dirección:</div>
                  <div className="font-semibold">
                    {drover.contactInfo?.address || "No disponible"}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">Email:</div>
                  <div className="font-semibold break-all">{drover.email}</div>
                </div>
                <div>
                  <div className="text-white/70">Ciudad:</div>
                  <div className="font-semibold">
                    {drover.city || "No especificada"}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">Teléfono:</div>
                  <div className="font-semibold">
                    {drover.contactInfo?.phone || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">Región:</div>
                  <div className="font-semibold">
                    {drover.region || "No especificada"}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">Fecha de nacimiento:</div>
                  <div className="font-semibold">
                    {drover?.contactInfo?.birthDate
                      ? new Date(
                        drover.contactInfo.birthDate
                      ).toLocaleDateString("es-ES")
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">País:</div>
                  <div className="font-semibold">
                    {drover.country || "No especificado"}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Botón volver movido dentro de la card de información */}
    </div>
  );
};

export default DroverProfile;
