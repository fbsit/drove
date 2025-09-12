
import React from "react";
import { Car, ArrowRight, BadgeCheck, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { TransferStatus } from "@/services/api/types/transfers";
import { Button } from '@/components/ui/button';

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
    <div className={`${size} flex items-center justify-center rounded-full bg-[#6EF7FF]/80 text-white font-bold border-2 border-[#6EF7FF]/40 ${isMobile ? 'text-sm' : 'text-lg'
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

  console.log("transfer ->", transfer)

  return (
    <div
      className={`bg-white/5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/10 flex lg:justify-between items-center gap-8 flex-wrap lg:flex-nowrap justify-center p-4 md:p-6 ${isMobile ? 'mb-4' : 'mb-6'}`}
    >


      {/* Vehículo */}
      <div className="flex items-center gap-3">
        <span className="bg-[#e5faff]/90 rounded-xl p-2 flex items-center justify-center">
          <Car size={20} className="text-black" />
        </span>
        <div>
          <h3 className="text-white font-bold text-base">
            {transfer?.brandVehicle || transfer?.brand} {transfer?.modelVehicle || transfer?.model}
          </h3>
          <p className="text-white/70 font-mono text-sm">
            {transfer?.bastidor || transfer?.vin}
          </p>
        </div>
      </div>

      {/* Origen y destino */}
      <div className="flex flex-col gap-1 font-mono text-sm text-white">
        <p>
          <span className="text-white/70">Origen:</span>{' '}
          <b>{transfer?.startAddress?.city || transfer?.origin}</b>
        </p>
        <p>
          <span className="text-white/70">Destino:</span>{' '}
          <b>{transfer?.endAddress?.city || transfer?.destination}</b>
        </p>
      </div>

      {/* Precio */}
      <div className="text-center bg-white/10 rounded-xl p-3">
        <span className="block text-2xl font-bold text-white">
          €{(transfer?.totalPrice || transfer?.precio)?.toLocaleString("es-ES", { maximumFractionDigits: 2 })}
        </span>
        <span className="block text-xs text-white/70">Precio del traslado</span>
      </div>

      {/* Drover */}
      <div className="flex flex-col items-center gap-2 text-sm text-white mt-1">
        <span className="text-white/70">Drover:</span>
        {transfer?.driver ? (
          <>
            <DroverAvatar name={transfer?.driver?.name} photo={transfer?.driver?.photo} />
            <span className="font-semibold">{transfer?.driver?.name}</span>
          </>
        ) : (
          <span className="italic text-white/60 ml-1">{transfer?.droverId || 'Sin asignar'}</span>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        {/* Estado */}
        <div className="flex justify-between items-center">
          <span
            className={`px-4 py-1 rounded-full font-semibold text-sm shadow-inner ${statusColors[transfer?.status] || "bg-gray-200 text-gray-700"
              }`}
          >
            {statusLabels[transfer?.status] || transfer?.status}
          </span>
          {transfer.status === TransferStatus.DELIVERED && (
            <span className="flex items-center gap-1 text-[#0FBF74] text-xs font-semibold">
              <BadgeCheck size={14} /> Finalizado
            </span>
          )}
        </div>
        <Link to={`/cliente/traslados/${transfer.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl hover:text-white border-[#6EF7FF]/30 text-[#6EF7FF] hover:bg-[#6EF7FF]/20 text-xs px-3 py-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver detalles
          </Button>
        </Link>
      </div>
    </div>

  );
};

export default ClientRecentTransferCard;
