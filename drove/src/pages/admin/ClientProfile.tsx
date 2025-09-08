import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  BadgeCheck,
  User,
  Building2,
  Award,
  TrendingUp,
  FileText,
  Car,
  Route,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import userService from "@/services/userService";
import { AdminService } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";

const estadoColors = {
  aprobado: "bg-emerald-600 text-white",
  pendiente: "bg-amber-500 text-black",
  rechazado: "bg-rose-700 text-white",
};

const estadoLabels = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
};

const tipoBadge = (tipo) => (
  <span
    className={`rounded-full px-2 py-1 text-xs font-semibold ${
      tipo === "empresa"
        ? "bg-[#2c76b8] text-white flex items-center gap-1"
        : "bg-[#6ef7ff] text-[#22142A]"
    }`}
    style={{ fontFamily: "Helvetica" }}
  >
    {tipo === "empresa" ? (
      <>
        <span className="flex gap-1 py-1">
          <Building2 size={13} className="mr-1" />
          Empresa
        </span>
      </>
    ) : (
      <>
        <span className="flex gap-1 py-1">
          <User size={13} className="mr-1" />
          Persona natural
        </span>
      </>
    )}
  </span>
);

const gamificationBadges = [
  {
    id: "gold",
    threshold: 40,
    label: "Destacado Gold",
    icon: <Award className="text-yellow-400" size={16} />,
    description: "Más de 40 traslados realizados",
  },
];

const ClientProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleGetUser = async () => {
    try {
      setIsLoading(true);
      // Obtener resumen desde backend unificado
      const summary = await AdminService.getClientSummary(id as string);
      setClient({
        ...summary,
        // Compatibilidad con render actual
        vehiculosTrasladados:
          summary?.vehicleStats?.map((v: any) => ({
            tipo: v.type,
            cantidad: v.count,
          })) || [],
        rutasFavoritas:
          summary?.favoriteRoutes?.map((r: any) => ({
            origen: r.origin,
            destino: r.destination,
            veces: r.count,
          })) || [],
        gamificacion: { traslados: summary?.tripsCount || 0 },
        gastoTotal: summary?.totalSpent || 0,
        contactInfo: summary?.contactInfo || {},
        tipo: (summary?.contactInfo?.companyName
          ? "empresa"
          : "persona") as any,
      });
    } catch (e) {
      console.error("Error cargando perfil", e);
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar el cliente por id
  useEffect(() => {
    handleGetUser();
  }, []);

  const [client, setClient] = useState<any>(null);

  // Modales para aprobar y rechazar
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 text-white">
        <div className="flex items-center justify-center h-40">
          <svg
            className="animate-spin mr-3 h-6 w-6 text-[#6EF7FF]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>Cargando perfil del cliente...</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-white">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Volver a Clientes
        </Button>
        <div className="mt-16 text-center text-xl">Cliente no encontrado</div>
      </div>
    );
  }

  const handleApproved = async () => {
    console.log("estado del cliente", client);
    try {
      await AdminService.approveUser(client.id);
      toast({
        title: "Usuario aprobado",
        description: "El usuario ha sido aprobado exitosamente.",
      });
      setOpenAprobar(false);
      handleGetUser();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejected = async () => {
    try {
      await AdminService.rejectUser(client.id);
      toast({
        title: "Usuario Rechazado",
        description: "El usuario ha sido rechazado.",
      });
      setOpenRechazar(false);
      handleGetUser();
    } catch (e) {
      console.error(e);
    }
  };

  // Responsive helper para chips (horizontal scroll si overflow)
  const renderVehiculosTrasladados = () => (
    <div className="flex gap-3 overflow-x-auto py-1 pb-2">
      {client.vehiculosTrasladados?.length ? (
        client.vehiculosTrasladados.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-[#2B2540] border border-[#6EF7FF]/20 text-[#6EF7FF] font-bold rounded-2xl px-4 py-2 shadow whitespace-nowrap min-w-[120px] text-sm"
          >
            <span className="inline-block w-4 h-4 rounded-full bg-[#6EF7FF]/40 mr-1"></span>
            <span className="mr-1">{v.tipo}</span>
            <span className="bg-[#6EF7FF] text-[#22142A] rounded-full px-2 py-0.5 text-xs ml-2">
              {v.cantidad}
            </span>
          </div>
        ))
      ) : (
        <div className="text-white/60 text-sm">
          Sin datos de vehículos trasladados.
        </div>
      )}
    </div>
  );

  // Estadísticas
  const traslados = client.gamificacion?.traslados ?? 0;
  const gastoTotal = client.gastoTotal || 0;
  const gastoPromedio = traslados > 0 ? gastoTotal / traslados : 0;
  const vehiculosCount = client.vehiculosTrasladados?.length || 0;
  const rutasCount = client.rutasFavoritas?.length || 0;

  // Generar lista mock de traslados realizados a partir de rutas favoritas (hasta que haya backend real)
  // Para MVP, la lista es flat, cada traslado = {origen, destino}
  const trasladosRealizados: { origen: string; destino: string }[] =
    client.rutasFavoritas?.flatMap((ruta) =>
      Array.from({ length: ruta.veces }).map(() => ({
        origen: ruta.origen,
        destino: ruta.destino,
      }))
    ) ?? [];

  return (
    <div className="bg-transparent p-0 animate-fade-in">
      {/* Fila de botones */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 xs:px-4 md:px-0 gap-2 mb-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="rounded-xl border-2 border-white/20 bg-transparent text-[#6EF7FF] hover:bg-[#6EF7FF] hover:text-[#22142A] h-10 px-6 py-2"
        >
          <ArrowLeft size={16} className="mr-2" /> Volver a Clientes
        </Button>
        {(client.status === "PENDING" || client.status === "REJECTED") && (
          <Dialog open={openAprobar} onOpenChange={setOpenAprobar}>
            <DialogTrigger asChild>
              <Button className="ml-auto rounded-xl bg-green-700 text-white hover:text-green-900 hover:bg-green-200 font-bold h-10 px-6 py-2">
                <BadgeCheck className="mr-2" size={17} /> Aprobar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aprobar Cliente</DialogTitle>
              </DialogHeader>
              <div className="mt-3 mb-5 text-white/90 text-sm">
                ¿Deseas aprobar el acceso de este cliente?
                <br />
                Podrá solicitar y gestionar traslados en la plataforma.
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleApproved}>Aprobar Cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {(client.status === "PENDING" || client.status === "APPROVED") && (
          <Dialog open={openRechazar} onOpenChange={setOpenRechazar}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="rounded-xl bg-red-500 text-white h-10 px-6 py-2"
              >
                <UserX size={16} className="mr-2" /> Rechazar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rechazar Cliente</DialogTitle>
              </DialogHeader>
              <div className="mt-3 mb-5 text-white/90 text-sm">
                ¿Seguro que deseas rechazar el acceso de este cliente?
                <br />
                El cliente no podrá operar ni visualizar su perfil.
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleRejected}>
                  Rechazar Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Header */}
      <div className="rounded-2xl gap-4 md:gap-6 bg-[#2B2540] px-3 md:px-8 py-5 md:py-7 shadow-lg border border-white/10">
        <div className="">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            {/* Avatar a la izquierda */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[#6ef7ff]/90 shadow-lg border-4 border-white overflow-hidden text-2xl sm:text-3xl font-bold uppercase text-[#22142A]">
              {client.avatar && client.avatar !== "" ? (
                <img
                  src={client.avatar}
                  alt={client.nombre}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                client.nombre?.charAt(0)
              )}
            </div>

            {/* Contenido a la derecha */}
            <div className="flex-1 text-center lg:text-left w-full">
              {/* Fila del nombre y chips */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-center justify-center lg:justify-start mb-3">
                <h1
                  className="text-xl sm:text-2xl lg:text-3xl font-bold break-words"
                  style={{ fontFamily: "Helvetica" }}
                >
                  {client?.contactInfo?.fullName}
                </h1>
                <div className="flex flex-wrap gap-2 items-center justify-start">
                  {tipoBadge(client.tipo)}
                  <span className="px-3 py-1 rounded-full font-semibold text-sm bg-amber-500">
                    {estadoLabels[client.status] || client.status}
                  </span>
                </div>
              </div>

              {/* Fila de email y teléfono */}
              <div className="flex flex-col gap-1 items-start lg:justify-start text-white/80 text-sm">
                <div className="flex items-center gap-1">
                  <Mail size={16} className="opacity-70" />
                  <span className="break-all">{client.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={16} className="opacity-70" />
                  <span>{client.contactInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        <div className="rounded-2xl bg-white/5 border border-white/15 p-5 text-center">
          <span className="text-white/70 text-sm block mb-1">Traslados</span>
          <div className="text-4xl font-bold text-[#6EF7FF]">{traslados}</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/15 p-5 text-center">
          <span className="text-white/70 text-sm block mb-1">Gasto total</span>
          <div className="text-4xl font-bold text-[#6EF7FF]">
            {gastoTotal.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/15 p-5 text-center">
          <span className="text-white/70 text-sm block mb-1">Promedio</span>
          <div className="text-4xl font-bold text-[#6EF7FF]">
            {gastoPromedio.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
        </div>
      </div>

      {/* Secciones en acordeón dentro de una sola Card */}
      <div className="rounded-lg overflow-hidden border bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-white/15">
        <Accordion type="multiple" className="space-y-0">
          {/* Tipos de vehículos */}
          <AccordionItem
            value="vehiculos"
            className="rounded-t-lg border-b border-white/10"
          >
            <AccordionTrigger className="w-full p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">
                      Tipos de vehículos trasladados
                    </p>
                    <p className="text-xs text-white/60">
                      {vehiculosCount} tipo(s) diferentes
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {renderVehiculosTrasladados()}
            </AccordionContent>
          </AccordionItem>

          {/* Rutas favoritas */}
          <AccordionItem
            value="rutas"
            className="rounded-none border-t border-b border-white/10"
          >
            <AccordionTrigger className="w-full p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Route className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Rutas favoritas</p>
                    <p className="text-xs text-white/60">
                      {rutasCount} ruta(s) frecuentes
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
                {client.rutasFavoritas?.length > 0 ? (
                  client.rutasFavoritas.map((ruta, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#2B2540] text-white/90 border border-[#6EF7FF]/15 min-w-[170px] max-w-xs whitespace-nowrap relative"
                    >
                      <TrendingUp className="text-[#6EF7FF]" size={18} />
                      <span className="overflow-hidden text-ellipsis text-sm font-medium max-w-[76px]">
                        {ruta.origen}
                      </span>
                      <span className="text-white/60">&#8594;</span>
                      <span className="overflow-hidden text-ellipsis text-sm font-medium max-w-[76px]">
                        {ruta.destino}
                      </span>
                      <span className="ml-2 flex-shrink-0">
                        <span className="inline-block bg-[#6EF7FF] text-[#22142A] px-2 py-0.5 rounded-full text-xs font-bold min-w-[40px] text-center">
                          {ruta.veces}{" "}
                          <span className="font-normal">traslados</span>
                        </span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60">Sin rutas destacadas aún.</div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sección de traslados realizados eliminada según requerimiento */}

          {/* Datos del cliente */}
          <AccordionItem
            value="datos"
            className="rounded-b-lg border-t border-white/10"
          >
            <AccordionTrigger className="w-full p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">
                      Datos del cliente
                    </p>
                    <p className="text-xs text-white/60">
                      Información personal y contacto
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90 text-sm md:text-base break-words">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Nombre
                  </div>
                  <div className="mt-1">{client.contactInfo.fullName}</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Tipo
                  </div>
                  <div className="mt-1">
                    {client.tipo === "empresa" ? "Empresa" : "Persona natural"}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Email
                  </div>
                  <div className="mt-1 break-all">{client.email}</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Teléfono
                  </div>
                  <div className="mt-1">{client.contactInfo.phone}</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Fecha registro
                  </div>
                  <div className="mt-1">{client.fecha}</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Ciudad
                  </div>
                  <div className="mt-1">{client.ciudad}</div>
                </div>
                <div className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    Dirección
                  </div>
                  <div className="mt-1">{client.direccion}</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Botón volver movido al top bar */}
    </div>
  );
};

export default ClientProfile;
