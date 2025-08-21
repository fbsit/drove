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
  "aprobado": "bg-emerald-600 text-white",
  "pendiente": "bg-amber-500 text-black",
  "rechazado": "bg-rose-700 text-white"
};

const estadoLabels = {
  "aprobado": "Aprobado",
  "pendiente": "Pendiente",
  "rechazado": "Rechazado"
};

const tipoBadge = tipo => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ml-1 ${
    tipo === "empresa"
      ? "bg-[#2c76b8] text-white flex items-center gap-1"
      : "bg-[#6ef7ff] text-[#22142A]"
  }`} style={{ fontFamily: "Helvetica" }}>
    {tipo === "empresa"
      ? (<><Building2 size={13} className="mr-1" />Empresa</>)
      : (<><User size={13} className="mr-1" />Persona natural</>)
    }
  </span>
);

const gamificationBadges = [
  {
    id: "gold",
    threshold: 40,
    label: "Destacado Gold",
    icon: <Award className="text-yellow-400" size={16} />,
    description: "Más de 40 traslados realizados"
  }
];

const ClientProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleGetUser = async () => {
    const clientInfo = await userService.getUserForAdmin(id);
    console.log("clientInfo", clientInfo);
    setClient(clientInfo);
  }

  // Buscar el cliente por id
  useEffect(() => {
    handleGetUser();
  }, [])

  const [client, setClient] = useState(null);

  // Modales para aprobar y rechazar
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);

  if (!client) {
    return (
      <div className="p-8 text-white">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} className="mr-2" /> Volver
        </Button>
        <div className="mt-16 text-center text-xl">Cliente no encontrado</div>
      </div>
    );
  }

  const handleApproved = async () => {
    console.log("estado del cliente", client);
    const result = await AdminService.approveUser(client.id);
    console.log("status", result);
    if(result.success){
      toast({
        title: "Usuario aprobado",
        description: "El usuario ha sido aprobado exitosamente.",
      });
      setOpenAprobar(false);
      handleGetUser()
    }
  }

  const handleRejected = async () => {
    const result = await AdminService.rejectUser(client.id);
    console.log("result", result);
    if(result.success){
      toast({
        title: "Usuario Rechazado",
        description: "El usuario ha sido rechazado.",
      });
      setOpenRechazar(false);
      handleGetUser()
    }
  }

  // Responsive helper para chips (horizontal scroll si overflow)
  const renderVehiculosTrasladados = () => (
    <div className="flex gap-3 overflow-x-auto py-1 pb-2">
      {client.vehiculosTrasladados?.length ? client.vehiculosTrasladados.map((v, i) => (
        <div key={i} className="flex items-center gap-2 bg-[#2B2540] border border-[#6EF7FF]/20 text-[#6EF7FF] font-bold rounded-2xl px-4 py-2 shadow whitespace-nowrap min-w-[120px] text-sm">
          <span className="inline-block w-4 h-4 rounded-full bg-[#6EF7FF]/40 mr-1"></span>
          <span className="mr-1">{v.tipo}</span>
          <span className="bg-[#6EF7FF] text-[#22142A] rounded-full px-2 py-0.5 text-xs ml-2">{v.cantidad}</span>
        </div>
      )) : (
        <div className="text-white/60 text-sm">Sin datos de vehículos trasladados.</div>
      )}
    </div>
  );

  // Estadísticas
  const traslados = client.gamificacion?.traslados ?? 0;
  const gastoTotal = client.gastoTotal || 0;
  const gastoPromedio = traslados > 0 ? gastoTotal / traslados : 0;

  // Generar lista mock de traslados realizados a partir de rutas favoritas (hasta que haya backend real)
  // Para MVP, la lista es flat, cada traslado = {origen, destino}
  const trasladosRealizados: { origen: string; destino: string }[] =
    client.rutasFavoritas?.flatMap((ruta) =>
      Array.from({ length: ruta.veces }).map(() => ({
        origen: ruta.origen,
        destino: ruta.destino
      }))
    ) ?? [];

  return (
    <div className="max-w-2xl mx-auto mt-2 md:mt-6 bg-[#1A1F2C] rounded-2xl shadow-lg p-0 overflow-hidden border border-white/10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-[#2B2540] px-3 xs:px-4 md:px-8 py-5 md:py-7 border-b border-white/10">
        {/* Avatar */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-[#6ef7ff]/90 shadow-md border-4 border-white overflow-hidden text-2xl md:text-3xl font-bold uppercase text-[#22142A]">
          {client.avatar && client.avatar !== "" ? (
            <img src={client.avatar} alt={client.nombre} className="w-full h-full object-cover rounded-full" />
          ) : (
            client.nombre?.charAt(0)
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap gap-2 items-center mb-1">
            <h1 className="text-lg xs:text-xl md:text-2xl text-white font-bold break-words" style={{ fontFamily: "Helvetica" }}>{client?.contactInfo?.fullName}</h1>
            {tipoBadge(client.tipo)}
            <span className={`px-3 py-1 rounded-full font-semibold text-xs md:text-sm ${estadoColors[client.status] || "bg-zinc-700 text-white"}`}>
              {estadoLabels[client.status] || client.status}
            </span>
          </div>
          <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 items-start xs:items-center mt-2 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Mail size={15} className="inline mr-1 opacity-70" />
              <span>{client.email}</span>
            </div>
            <span className="hidden xs:block mx-2">|</span>
            <div className="flex items-center gap-1">
              <Phone size={15} className="inline mr-1 opacity-70" />
              <span>{client.contactInfo.phone}</span>
            </div>
          </div>
        </div>
        {/* Acciones rápidas */}
        <div className="flex gap-2 items-center mt-4 md:mt-0 w-full md:w-auto justify-center">
          {/* Aprobar (si pendiente o rechazado) */}
          {(client.status === "PENDING" || client.status === "REJECTED") && (
            <Dialog className="bg-black" open={openAprobar} onOpenChange={setOpenAprobar}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" className="w-full md:w-auto rounded-2xl">
                  <BadgeCheck size={17} className="mr-2" /> Aprobar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aprobar Cliente</DialogTitle>
                </DialogHeader>
                <div className="mt-3 mb-5 text-white/90 text-sm">
                  ¿Deseas aprobar el acceso de este cliente?<br/>
                  Podrá solicitar y gestionar traslados en la plataforma.
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
                    Aprobar Cliente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {/* Rechazar (si pendiente o aprobado) */}
          {(client.status === "PENDING" || client.status === "APPROVED") && (
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
                  <DialogTitle>Rechazar Cliente</DialogTitle>
                </DialogHeader>
                <div className="mt-3 mb-5 text-white/90 text-sm">
                  ¿Seguro que deseas rechazar el acceso de este cliente?<br />
                  El cliente no podrá operar ni visualizar su perfil.
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
                    Rechazar Cliente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Sección de tipos de vehículos trasladados */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 pt-3 pb-1">
        <h3 className="text-white font-semibold mb-2 text-base md:text-lg" style={{ fontFamily: "Helvetica" }}>Tipos de vehículos trasladados</h3>
        {renderVehiculosTrasladados()}
      </div>

      {/* Gamificación, métricas y estadísticas SIN calificación */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 pt-3 md:pt-4 pb-2 md:pb-5 flex flex-nowrap gap-3 xs:gap-6 overflow-x-auto items-center border-b border-white/15">
        {/* Total traslados */}
        <div className="flex flex-col items-center gap-1 min-w-[110px] bg-[#2B2540]/90 px-3 py-3 rounded-2xl border border-[#6EF7FF]/10 shadow-inner">
          <span className="text-xs text-white/60 font-medium">Traslados</span>
          <div className="text-lg font-bold text-[#6EF7FF] font-mono">{traslados}</div>
        </div>
        {/* Gasto total */}
        <div className="flex flex-col items-center gap-1 min-w-[130px] bg-[#2B2540]/90 px-3 py-3 rounded-2xl border border-[#6EF7FF]/10 shadow-inner">
          <span className="text-xs text-white/60 font-medium">Gasto total</span>
          <div className="text-lg font-bold text-[#6EF7FF] font-mono">{gastoTotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</div>
        </div>
        {/* Promedio por traslado */}
        <div className="flex flex-col items-center gap-1 min-w-[130px] bg-[#2B2540]/90 px-3 py-3 rounded-2xl border border-[#6EF7FF]/10 shadow-inner">
          <span className="text-xs text-white/60 font-medium">Promedio traslado</span>
          <div className="text-lg font-bold text-[#6EF7FF] font-mono">{gastoPromedio.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</div>
        </div>
        {/* Insignia Gold */}
        {traslados > 40 && (
          <div className="flex flex-col gap-1 min-w-[110px]">
            <div className="flex items-center gap-1">
              {gamificationBadges.map(b =>
                traslados > b.threshold ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-white font-semibold text-xs" key={b.id}>
                    {b.icon} {b.label}
                  </div>
                ) : null
              )}
            </div>
            <span className="text-xs text-white/60">Medallas</span>
          </div>
        )}
      </div>
      {/* Rutas favoritas (fix texto cantidad traslados, mobile friendly) */}
      <div className="bg-[#1A1F2C] px-3 xs:px-4 md:px-8 py-3 md:py-4 border-b border-white/15">
        <h3 className="text-white font-semibold mb-2 text-base md:text-lg" style={{ fontFamily: "Helvetica" }}>Rutas favoritas</h3>
        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
          {client.rutasFavoritas?.length > 0 ? client.rutasFavoritas.map((ruta, i) => (
            <div key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#2B2540] text-white/90 border border-[#6EF7FF]/15 min-w-[170px] max-w-xs whitespace-nowrap relative"
            >
              <TrendingUp className="text-[#6EF7FF]" size={18} />
              <span className="overflow-hidden text-ellipsis text-sm font-medium max-w-[76px]">{ruta.origen}</span>
              <span className="text-white/60">&#8594;</span>
              <span className="overflow-hidden text-ellipsis text-sm font-medium max-w-[76px]">{ruta.destino}</span>
              {/* Cantidad de traslados como badge */}
              <span className="ml-2 flex-shrink-0">
                <span className="inline-block bg-[#6EF7FF] text-[#22142A] px-2 py-0.5 rounded-full text-xs font-bold min-w-[40px] text-center">
                  {ruta.veces} <span className="font-normal">traslados</span>
                </span>
              </span>
            </div>
          )) : (
            <div className="text-white/60">Sin rutas destacadas aún.</div>
          )}
        </div>
      </div>
      {/* Lista de traslados realizados (compacta) */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 py-4 border-b border-white/15">
        <h3 className="text-white font-semibold mb-2 text-base md:text-lg" style={{ fontFamily: "Helvetica" }}>Traslados realizados</h3>
        {trasladosRealizados.length > 0 ? (
          <div className="max-h-36 overflow-auto">
            <table className="w-full text-left text-white/85 text-sm">
              <thead>
                <tr>
                  <th className="py-1 font-semibold">Origen</th>
                  <th className="py-1 font-semibold">Destino</th>
                </tr>
              </thead>
              <tbody>
                {trasladosRealizados.map((t, idx) => (
                  <tr key={idx} className="even:bg-white/5">
                    <td className="py-1 px-1">{t.origen}</td>
                    <td className="py-1 px-1">{t.destino}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-white/60 text-sm">Sin traslados registrados aún.</div>
        )}
      </div>
      {/* Datos personales */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 py-5 md:py-7">
        <h3 className="text-white font-semibold mb-2 text-base md:text-lg" style={{ fontFamily: "Helvetica" }}>Datos del cliente</h3>
        <div className="space-y-1 text-white/90 text-sm md:text-base break-words">
          <div><b>Nombre:</b> {client.contactInfo.fullName}</div>
          <div><b>Tipo:</b> {client.tipo === "empresa" ? "Empresa" : "Persona natural"}</div>
          <div><b>Email:</b> <span className="break-all">{client.email}</span></div>
          <div><b>Teléfono:</b> {client.contactInfo.phone}</div>
          <div><b>Fecha de registro:</b> {client.fecha}</div>
          <div><b>Dirección:</b> {client.direccion}</div>
          <div><b>Ciudad:</b> {client.ciudad}</div>
          <div><b>Provincia:</b> {client.provincia}</div>
          <div><b>País:</b> {client.pais}</div>
          <div><b>Código Postal:</b> {client.codigoPostal}</div>
          {client.notas && <div><b>Notas Internas:</b> {client.notas}</div>}
        </div>
      </div>
      {/* Botón volver */}
      <div className="bg-[#22142A] px-3 xs:px-4 md:px-8 py-3 md:py-4 flex justify-end border-t border-white/10">
        <Button variant="secondary" onClick={() => navigate(-1)} className="rounded-2xl">
          <ArrowLeft className="mr-2" size={18}/> Volver a la lista
        </Button>
      </div>
    </div>
  );
};

export default ClientProfile;
