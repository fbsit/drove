
import React, { useState } from "react";
import { Car, ArrowRight, BadgeCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import ReviewModal from "./ReviewModal";
import { TransferStatus } from "@/services/api/types/transfers";

type Transfer = {
  id: string;
  created_at: string;
  status: string;
  price: number;
  pickup_details: {
    originAddress: string;
    destinationAddress: string;
    pickupDate: string;
  };
  vehicle_details: {
    brand: string;
    model: string;
    licensePlate: string;
  };
  drover?: {
    full_name: string;
  };
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
    droverResponse?: string;
    adminResponse?: string;
  };
};

interface Props {
  transfer: Transfer;
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

const ClientTransferCard: React.FC<Props> = ({ transfer }) => {
  const { brand, model, licensePlate } = transfer.vehicle_details;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReview, setHasReview] = useState(!!transfer.review);

  const handleReviewSubmitted = (review: { rating: number; comment: string }) => {
    setHasReview(true);
    // En una aplicación real, aquí actualizaríamos el estado global o recargaríamos los datos
  };

  const isCompleted = transfer.status === TransferStatus.DELIVERED;
  const canLeaveReview = isCompleted && !hasReview;
  const hasExistingReview = isCompleted && hasReview && transfer.review;

  return (
    <div className="bg-gradient-to-tr from-white/90 to-[#f4fcff] rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 shadow hover:scale-105 transition-transform">
      {/* Encabezado de la tarjeta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-[#e5faff] rounded-xl p-1">
            <Car size={20} className="text-[#22142A]" />
          </span>
          <span className="ml-1 text-xs text-[#516081] font-montserrat">{transfer.created_at.split("T")[0]}</span>
        </div>
        <div className="font-montserrat text-xs text-[#7B8794] mb-2">Detalles del automóvil</div>
        <div className="flex gap-3 font-bold text-base text-[#22142A]">
          <span>{brand} {model}</span>
          <span className="ml-4 font-mono text-[#22142A]">{licensePlate}</span>
        </div>
        <div className="mt-1 flex flex-col gap-0.5 text-[#7B8794] text-xs font-mono">
          <span>Origen: <b>{transfer.pickup_details.originAddress}</b></span>
          <span>Destino: <b>{transfer.pickup_details.destinationAddress}</b></span>
        </div>

        {/* Mostrar rating si existe reseña */}
        {hasExistingReview && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[#7B8794] font-montserrat">Tu valoración:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= transfer.review!.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="text-xs text-[#7B8794] ml-1">({transfer.review!.rating}/5)</span>
            </div>
          </div>
        )}
      </div>

      {/* Precio */}
      <div className="flex flex-col items-center justify-center px-4">
        <span className="block font-bold text-2xl text-[#0FBF74]">€{transfer.price.toLocaleString("es-ES", { maximumFractionDigits: 2 })}</span>
        <span className="block text-xs text-[#0FBF74] font-montserrat">Precio del traslado</span>
      </div>

      {/* Estado */}
      <div className="flex flex-col items-center justify-center px-4">
        <span className={`px-4 py-1 rounded-full text-sm font-bold font-helvetica mb-1 ${statusColors[transfer.status] || "bg-gray-200 text-gray-700"}`}>
          {statusLabels[transfer.status] || transfer.status}
        </span>
        {transfer.status === TransferStatus.DELIVERED && (
          <span className="text-[10px] text-[#0FBF74] flex items-center gap-1"><BadgeCheck size={14} /> Finalizado</span>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-2 items-end">
        <Link
          to={`/cliente/traslados/${transfer.id}`}
          className="text-[#22142A] hover:text-[#6EF7FF] hover:underline rounded-2xl font-bold flex items-center gap-1 px-5 py-2 transition"
          style={{ fontFamily: 'Helvetica' }}
        >
          Ver detalles <ArrowRight size={16} />
        </Link>

        {/* Botón de reseña para traslados completados sin reseña */}
        {canLeaveReview && (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-gradient-to-r from-[#6EF7FF] to-[#FFD700] hover:from-[#32dfff] hover:to-[#FFC700] text-[#22142A] font-bold flex items-center gap-1 px-4 py-2 rounded-2xl transition text-sm"
            style={{ fontFamily: 'Helvetica' }}
          >
            <Star size={14} />
            Dejar reseña
          </button>
        )}

        {/* Mostrar si ya tiene reseña */}
        {hasExistingReview && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <Star size={12} className="fill-current" />
            Reseña enviada
          </div>
        )}
      </div>

      {/* Modal de reseña */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        transferId={transfer.id}
        droverName={transfer.drover?.full_name || 'Drover'}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ClientTransferCard;
