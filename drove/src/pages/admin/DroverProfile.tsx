import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, BadgeCheck, User, Building2, Award, Star, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import userService from '@/services/userService';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

const estadoColors = {
  "APPROVED": "bg-emerald-600 text-white",
  "PENDING": "bg-amber-500 text-black",
  "REJECTED": "bg-rose-700 text-white"
};

const estadoLabels = {
  "APPROVED": "Aprobado",
  "PENDING": "Pendiente",
  "REJECTED": "Rechazado"
};

const tipoBadge = tipo => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ml-1 ${tipo === "drover_core"
      ? "bg-[#2c76b8] text-white flex items-center gap-1"
      : "bg-[#6ef7ff] text-[#22142A]"
    }`} style={{ fontFamily: "Helvetica" }}>
    {tipo === "drover_core"
      ? (<><Building2 size={13} className="mr-1" />Drover Core</>)
      : (<><User size={13} className="mr-1" />Drover Flex</>)
    }
  </span>
);

const DroverProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleGetUser = async () => {
    const droverInfo = await userService.getUserForAdmin(id);
    console.log("droverInfo", droverInfo);
    setDrover(droverInfo);
  }

  // Buscar el drover por id
  useEffect(() => {
    handleGetUser();
  }, [])

  const [drover, setDrover] = useState(null);

  // Modales para aprobar y rechazar
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);

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

  const handleApproved = async () => {
    const result = await AdminService.approveUser(drover.id);
    if (result && result.success) {
      toast({
        title: "Usuario aprobado",
        description: "El drover ha sido aprobado exitosamente.",
      });
      setOpenAprobar(false);
      setOpenRechazar(false);
      handleGetUser(); // Recargar datos
    }
  }

  const handleRejected = async () => {
    const result = await AdminService.rejectUser(drover.id);
    if (result && result.success) {
      toast({
        title: "Usuario rechazado",
        description: "El drover ha sido rechazado exitosamente.",
      });
      setOpenRechazar(false);
      setOpenAprobar(false);
      handleGetUser(); // Recargar datos
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-2 md:mt-6 bg-[#1A1F2C] rounded-2xl shadow-lg p-0 overflow-hidden border border-white/10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-[#2B2540] px-3 xs:px-4 md:px-8 py-5 md:py-7 border-b border-white/10">
        {/* Avatar */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-[#6ef7ff]/90 shadow-md border-4 border-white overflow-hidden text-2xl md:text-3xl font-bold uppercase text-[#22142A]">
          {drover.avatar && drover.avatar !== "" ? (
            <img src={drover.avatar} alt={drover.contactInfo?.fullName} className="w-full h-full object-cover rounded-full" />
          ) : (
            drover.contactInfo?.fullName?.charAt(0)
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap gap-2 items-center mb-1">
            <h1 className="text-lg xs:text-xl md:text-2xl text-white font-bold break-words" style={{ fontFamily: "Helvetica" }}>{drover?.contactInfo?.fullName}</h1>
            {tipoBadge(drover.role)}
            <span className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm ${estadoColors[drover.status] || "bg-zinc-700 text-white"}`}>
              {estadoLabels[drover.status] || drover.status}
            </span>
          </div>
          <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 items-start xs:items-center mt-2 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Mail size={15} className="inline mr-1 opacity-70" />
              <span>{drover.email}</span>
            </div>
            <span className="hidden xs:block mx-2">|</span>
            <div className="flex items-center gap-1">
              <Phone size={15} className="inline mr-1 opacity-70" />
              <span>{drover.contactInfo?.phone}</span>
            </div>
          </div>
        </div>
        {/* Acciones rápidas */}
        <div className="flex gap-2 items-center mt-4 md:mt-0 w-full md:w-auto justify-center">
          {/* Aprobar (si pendiente o rechazado) */}
          {(drover.status === "PENDING" || drover.status === "REJECTED") && (
            <Dialog open={openAprobar} onOpenChange={setOpenAprobar}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" className="w-full md:w-auto rounded-2xl">
                  <BadgeCheck size={17} className="mr-2" /> Aprobar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aprobar Drover</DialogTitle>
                </DialogHeader>
                <div className="mt-3 mb-5 text-white/90 text-sm">
                  ¿Deseas aprobar el acceso de este drover?<br />
                  Podrá realizar traslados en la plataforma.
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button
                    onClick={() => {
                      handleApproved()
                    }}
                  >
                    Aprobar Drover
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {/* Rechazar (si pendiente o aprobado) */}
          {(drover.status === "PENDING" || drover.status === "APPROVED") && (
            <Dialog open={openRechazar} onOpenChange={setOpenRechazar}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full md:w-auto rounded-2xl"
                >
                  <FileText size={17} className="mr-2" /> Rechazar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rechazar Drover</DialogTitle>
                </DialogHeader>
                <div className="mt-3 mb-5 text-white/90 text-sm">
                  ¿Seguro que deseas rechazar el acceso de este drover?<br />
                  El drover no podrá operar ni visualizar su perfil.
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejected()
                    }}
                  >
                    Rechazar Drover
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 py-5 md:py-7">
        <h3 className="text-white font-semibold mb-2 text-base md:text-lg" style={{ fontFamily: "Helvetica" }}>Datos del drover</h3>
        <div className="space-y-1 text-white/90 text-sm md:text-base break-words">
          <div><b>Nombre:</b> {drover.contactInfo?.fullName}</div>
          <div><b>Tipo:</b> {drover.role === "drover_core" ? "Drover Core" : "Drover Flex"}</div>
          <div><b>Email:</b> <span className="break-all">{drover.email}</span></div>
          <div><b>Teléfono:</b> {drover.contactInfo?.phone}</div>
          <div><b>Fecha de registro:</b> {drover.created_at ? new Date(drover.created_at).toLocaleDateString('es-ES') : 'No disponible'}</div>
          <div><b>Ciudad:</b> {drover.city || 'No especificada'}</div>
          <div><b>País:</b> {drover.country || 'No especificado'}</div>
          <div><b>Estado:</b> {estadoLabels[drover.status] || drover.status}</div>
        </div>
      </div>

      {/* Botón volver */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 py-3 md:py-4 flex justify-end border-t border-white/10">
        <Button variant="secondary" onClick={() => navigate(-1)} className="rounded-2xl">
          <ArrowLeft className="mr-2" size={18} /> Volver a la lista
        </Button>
      </div>
    </div>
  );
};

export default DroverProfile;