
import React from "react";
import { Car, ArrowRight, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { TransferStatus } from "@/services/api/types/transfers";

// Para avatar del drover
function DroverAvatar({ name, photo }: { name?: string; photo?: string }) {
  const isMobile = useIsMobile();
  const size = isMobile ? 'w-6 h-6' : 'w-8 h-8';
  
  if (photo)
    return (
      <img
        src={photo}
        alt={name ? `Foto de ${name}` : "Drover"}
        className={`${size} rounded-full object-cover bg-gray-200 border-2 border-[#6EF7FF]/60`}
      />
    );
  // Si no hay foto: mostrar inicial
  const initial = name ? name.trim().charAt(0).toUpperCase() : "D";
  return (
    <div className={`${size} flex items-center justify-center rounded-full bg-[#6EF7FF]/80 text-[#22142A] font-bold border-2 border-[#6EF7FF]/40 ${
      isMobile ? 'text-sm' : 'text-lg'
    }`}>
      {initial}
    </div>
  );
}

const statusColors: Record<string, string> = {
  [TransferStatus.PENDINGPAID]: "bg-orange-200 text-orange-900",
  [TransferStatus.CREATED]: "bg-gray-200 text-gray-900",
  [TransferStatus.ASSIGNED]: "bg-purple-100 text-purple-700",
  [TransferStatus.PICKED_UP]: "bg-indigo-100 text-indigo-700",
  [TransferStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700",
  [TransferStatus.REQUEST_FINISH]: "bg-pink-100 text-pink-700",
  [TransferStatus.DELIVERED]: "bg-green-100 text-green-700",
  [TransferStatus.CANCELLED]: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  [TransferStatus.PENDINGPAID]: "Pendiente Pago",
  [TransferStatus.CREATED]: "Creado",
  [TransferStatus.ASSIGNED]: "Asignado",
  [TransferStatus.PICKED_UP]: "Recogido",
  [TransferStatus.IN_PROGRESS]: "En Progreso",
  [TransferStatus.REQUEST_FINISH]: "Solicita Finalizar",
  [TransferStatus.DELIVERED]: "Entregado",
  [TransferStatus.CANCELLED]: "Cancelado",
};

interface RecentTransferCardProps {
  transfer: {
    id: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    origin: string;
    destination: string;
    brand: string;
    model: string;
    vin: string;
    remitente: string;
    receptor: string;
    fechaHora: string;
    driver?: { name: string; phone: string; photo?: string };
    distancia: string;
    precio: number;
    // Propiedades adicionales
    brandVehicle?: string;
    modelVehicle?: string;
    bastidor?: string;
    startAddress?: { city: string };
    endAddress?: { city: string };
    droverId?: string;
    totalPrice?: number;
  };
}

const ClientRecentTransferCard: React.FC<RecentTransferCardProps> = ({ transfer }) => {
  const isMobile = useIsMobile();

  console.log("transfer ->",transfer) 
  
  return (
    <div className={`bg-gradient-to-tr from-white/90 to-[#f4fcff] rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow hover:scale-105 transition-transform ${
      isMobile ? 'p-3 mb-3' : 'p-5 mb-4'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-[#e5faff] rounded-xl p-1">
            <Car size={isMobile ? 16 : 20} className="text-[#22142A]" />
          </span>
          <span className={`ml-1 text-[#516081] font-montserrat ${isMobile ? 'text-xs' : 'text-xs'}`}>{transfer.createdAt.split("T")[0]}</span>
        </div>
        <div className={`font-montserrat text-[#7B8794] ${isMobile ? 'text-xs mb-1' : 'text-xs mb-2'}`}>Traslado reciente</div>
        <div className={`flex gap-3 font-bold text-[#22142A] ${isMobile ? 'text-sm' : 'text-base'}`}>
          <span>{transfer?.brandVehicle || transfer?.brand} {transfer?.modelVehicle || transfer?.model}</span>
          <span className={`ml-4 font-mono text-[#22142A] ${isMobile ? 'text-xs' : 'text-base'}`}>{transfer?.bastidor || transfer?.vin}</span>
        </div>
        <div className={`mt-1 flex flex-col text-[#7B8794] font-mono ${isMobile ? 'gap-0 text-xs' : 'gap-0.5 text-xs'}`}>
          <span>Origen: <b>{transfer?.startAddress?.city || transfer?.origin}</b></span>
          <span>Destino: <b>{transfer?.endAddress?.city || transfer?.destination}</b></span>
        </div>
        {/* Drover (solo nombre y avatar, sin teléfono) */}
        <div className={`mt-2 flex items-center gap-2 font-montserrat text-[#22142A] ${isMobile ? 'text-xs' : 'text-xs'}`}>
          <b>Drover:</b>
          {transfer?.driver ? (
            <>
              <DroverAvatar name={transfer?.driver?.name} photo={transfer?.driver?.photo} />
              <span className="ml-1 font-semibold">{transfer?.driver?.name}</span>
            </>
          ) : (
            <span className="italic text-[#636363] ml-1">{transfer?.droverId || 'Sin asignar'}</span>
          )}
        </div>
      </div>
      {/* Precio */}
      <div className={`flex flex-col items-center justify-center ${isMobile ? 'px-2' : 'px-4'}`}>
        <span className={`block font-bold text-[#0FBF74] ${isMobile ? 'text-xl' : 'text-2xl'}`}>€{(transfer?.totalPrice || transfer?.precio)?.toLocaleString("es-ES",{maximumFractionDigits:2})}</span>
        <span className={`block text-[#0FBF74] font-montserrat ${isMobile ? 'text-xs' : 'text-xs'}`}>Precio del traslado</span>
      </div>
      {/* Estado */}
      <div className={`flex flex-col items-center justify-center ${isMobile ? 'px-2' : 'px-4'}`}>
        <span className={`px-4 py-1 rounded-full font-bold font-helvetica mb-1 ${statusColors[transfer?.status] || "bg-gray-200 text-gray-700"} ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>
          {statusLabels[transfer?.status] || transfer?.status}
        </span>
        {transfer.status === TransferStatus.DELIVERED && (
          <span className={`block text-[#0FBF74] flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-[10px]'}`}><BadgeCheck size={isMobile ? 12 : 14}/> Finalizado</span>
        )}
      </div>
      <Link
        to={`/cliente/traslados/${transfer.id}`}
        className={`ml-auto text-[#22142A] hover:text-[#6EF7FF] hover:underline rounded-2xl font-bold flex items-center gap-1 transition ${
          isMobile ? 'px-3 py-1.5 mt-2 text-sm' : 'px-5 py-2 mt-3 text-base'
        }`}
        style={{ fontFamily: 'Helvetica' }}
      >
        Ver detalles <ArrowRight size={isMobile ? 14 : 16}/>
      </Link>
    </div>
  );
};

export default ClientRecentTransferCard;
