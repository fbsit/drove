
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TransferStatus } from "@/services/api/types/transfers";
import { Zap, Trophy, Calendar, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium";

  switch(status) {
    case TransferStatus.DELIVERED:
      return (
        <span className={`${base} bg-green-500/20 text-green-300`}>
          <Trophy size={14} />
          Completado
        </span>
      );
    case TransferStatus.IN_PROGRESS:
      return (
        <span className={`${base} bg-blue-500/20 text-blue-300`}>
          <Zap size={14} />
          En Progreso
        </span>
      );
    case TransferStatus.PICKED_UP:
      return (
        <span className={`${base} bg-amber-500/20 text-amber-300`}>
          <CheckCircle size={14} />
          Vehículo Recogido
        </span>
      );
    case TransferStatus.ASSIGNED:
      return (
        <span className={`${base} bg-purple-500/20 text-purple-300`}>
          <UserCheck size={14} />
          Asignado
        </span>
      );
    case TransferStatus.CREATED:
      return (
        <span className={`${base} bg-white/10 text-white`}>
          <Calendar size={14} />
          Creado
        </span>
      );
    case TransferStatus.PENDINGPAID:
      return (
        <span className={`${base} bg-yellow-500/20 text-yellow-300`}>
          <AlertTriangle size={14} />
          Pendiente
        </span>
      );
    case TransferStatus.REQUEST_FINISH:
      return (
        <span className={`${base} bg-amber-500/20 text-amber-300`}>
          <AlertTriangle size={14} />
          Solicitando Entrega
        </span>
      );
    case TransferStatus.CANCELLED:
      return (
        <span className={`${base} bg-red-500/20 text-red-300`}>
          <AlertTriangle size={14} />
          Cancelado
        </span>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default StatusBadge;
