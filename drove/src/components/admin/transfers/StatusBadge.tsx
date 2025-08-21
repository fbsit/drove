
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TransferStatus } from "@/services/api/types/transfers";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch(status) {
    case TransferStatus.DELIVERED:
      return <Badge className="bg-green-500 hover:bg-green-600">Entregado</Badge>;
    case TransferStatus.IN_PROGRESS:
      return <Badge className="bg-purple-500 hover:bg-purple-600">En Progreso</Badge>;
    case TransferStatus.PICKED_UP:
      return <Badge className="bg-orange-500 hover:bg-orange-600">Vehículo Recogido</Badge>;
    case TransferStatus.ASSIGNED:
      return <Badge className="bg-indigo-500 hover:bg-indigo-600">Drover Asignado</Badge>;
    case TransferStatus.CREATED:
      return <Badge className="bg-blue-500 hover:bg-blue-600">Creado</Badge>;
    case TransferStatus.PENDINGPAID:
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente de Pago</Badge>;
    case TransferStatus.REQUEST_FINISH:
      return <Badge className="bg-amber-500 hover:bg-amber-600">Solicitando Entrega</Badge>;
    case TransferStatus.CANCELLED:
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default StatusBadge;
