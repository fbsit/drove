
import React, { useState } from "react";
import { Car, User, Calendar, MapPin, ArrowRight, Trophy, Zap, AlertCircle, UserCheck, RefreshCcw, MoreVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import RescheduleModal from "./RescheduleModal";
import { TransferStatus } from "@/services/api/types/transfers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  transfer: any;
  gamify?: boolean;
}

const getGamifyIcon = (status: string) => {
  if (status === TransferStatus.DELIVERED) return <Trophy className="text-green-400" size={20} />;
  if (status === TransferStatus.IN_PROGRESS) return <Zap className="text-purple-400" size={20} />;
  if (status === TransferStatus.ASSIGNED) return <UserCheck className="text-indigo-400" size={20} />;
  if (status === TransferStatus.CREATED || status === TransferStatus.PENDINGPAID)
    return <Calendar className="text-amber-400" size={20} />;
  return <AlertCircle className="text-red-400" size={20} />;
};

const TransferCard: React.FC<Props> = ({ transfer, gamify }) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const isCompleted = transfer.status === TransferStatus.DELIVERED;
  const isAssigned = transfer.status === TransferStatus.ASSIGNED;
  const isInProgress = transfer.status === TransferStatus.IN_PROGRESS;
  const assignedDriver = transfer.droverName || transfer.drivers?.full_name;
  const shouldShowAssignButton = !isCompleted && !isAssigned && !isInProgress;

  const formatDate = (dateInput: any) => {
    if (!dateInput) return '—';
    try {
      let date: Date;
      if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'object') {
        const val = (dateInput as any).createdAt || (dateInput as any).created_at || null;
        date = val ? new Date(val) : new Date();
      } else {
        return '—';
      }
      if (isNaN(date.getTime())) return '—';
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return '—';
    }
  };

  const handleVerClick = () => {
    console.log("TransferCard - Navegando a detalle del traslado:", transfer.id);
    console.log("URL objetivo:", `/traslados/${transfer.id}`);
  };

  return (
    <>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-sm flex flex-col gap-3 w-full lg:w-[49%] ">
        <div className="flex items-center gap-2">
          {gamify && getGamifyIcon(transfer.status)}
          <StatusBadge status={transfer.status} />
          <span className="ml-auto text-sm text-white/60">{formatDate(transfer.scheduledDate || transfer.createdAt || transfer.created_at)}</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <User size={16} className="text-white/70" />
          <div>
            <p className="font-medium text-white">
              {transfer.clientName || transfer.users?.company_name || transfer.users?.full_name}
            </p>
            <p className="text-xs text-white/70">{transfer.clientEmail || transfer.users?.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Car size={16} className="text-white/70" />
          <p className="text-white">{transfer.brand || '—'} {transfer.model || ''}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <MapPin size={16} className="text-white/70" />
          <div className="flex flex-col">
            <span className="text-white text-sm">{transfer.origin || '—'}</span>
            <span className="text-xs text-white/70">{transfer.destination || '—'}</span>
          </div>
        </div>

        {/* Precio e información del conductor (mapea correctamente los campos) */}
        <div className="flex flex-col gap-2">
          <span className="text-base font-bold text-[#6EF7FF]">
            {Number(transfer.totalPrice ?? transfer.price ?? 0).toFixed(2)}&nbsp;€
          </span>

          {/* Información del conductor asignado */}
          {(isAssigned || isInProgress) && assignedDriver && (
            <div className="text-white/90 text-sm flex items-center gap-1 justify-center">
              <UserCheck size={14} className={isAssigned ? "text-indigo-400" : "text-purple-400"} />
              <span className="mr-1">{isAssigned ? "Asignado a:" : "Conducido por:"}</span>
              <span className="font-semibold">{assignedDriver}</span>
            </div>
          )}

          {/* Información del conductor para traslados completados */}
          {isCompleted && assignedDriver && (
            <div className="text-white/90 text-sm">
              <span className="mr-1">Conducido por:</span>
              <span className="font-semibold">{assignedDriver}</span>
            </div>
          )}
        </div>

        {/* Botones de acción - Nueva fila separada */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          {/* Primera fila: Botón Ver siempre visible (admin → detalle activo) */}

          {/* Segunda fila: Botones condicionales */}
          {(shouldShowAssignButton || isAssigned || transfer.status === TransferStatus.CREATED) && (
            <div className="flex flex-col gap-2">
              {/* Botón Asignar/Reasignar según estado */}
              {shouldShowAssignButton ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#6EF7FF] text-[#6EF7FF] hover:bg-[#6EF7FF] hover:text-[#22142A] w-full"
                  asChild
                >
                  <Link to={`/admin/asignar/${transfer.id}`}>Asignar Drover</Link>
                </Button>
              ) : isAssigned ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-400/50 text-orange-400 hover:bg-orange-400/10 w-full"
                  asChild
                >
                  <Link to={`/admin/reasignar/${transfer.id}`}>Reasignar Drover</Link>
                </Button>
              ) : null}

              {/* Botón Reagendar para traslados created o assigned */}
              {(transfer.status === TransferStatus.CREATED || transfer.status === TransferStatus.ASSIGNED) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 w-full"
                  onClick={() => setShowRescheduleModal(true)}
                >
                  <Calendar size={14} className="mr-1" />
                  Reagendar
                </Button>
              )}

              {/* Botón Reasignar solo para traslados asignados */}
              {isAssigned && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-400/50 text-orange-400 hover:bg-orange-400/10 w-full"
                  asChild
                >
                  <Link to={`/admin/reasignar/${transfer.id}`}>
                    <RefreshCcw size={14} className="mr-1" />
                    Reasignar
                  </Link>
                </Button>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleVerClick} asChild>
              <Link to={`/traslados/activo/${transfer.id}`}>
                Ver <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        transferId={transfer.id}
        currentDate={transfer.pickup_details?.pickupDate}
        currentTime={transfer.pickup_details?.pickupTime}
      />
    </>
  );
};

export default TransferCard;
