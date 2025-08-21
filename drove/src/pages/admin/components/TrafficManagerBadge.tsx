
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, X } from "lucide-react";

/**
 * Badge UI/UX para estado de Jefe de Tráfico según regla visual Drove
 */
const TrafficManagerBadge = ({
  active,
  invited,
}: {
  active: boolean;
  invited: boolean;
}) => {
  // Colores y mensajes siguiendo guía Drove: verde activo, gris inactivo, azul claro invitado pendiente
  if (active) {
    return (
      <Badge className="bg-green-500 text-white rounded-2xl px-3 py-1">
        Activo
      </Badge>
    );
  }
  if (invited) {
    return (
      <Badge className="bg-blue-400 text-white rounded-2xl px-3 py-1 flex items-center gap-1">
        <Mail size={14} className="inline" /> Invitación pendiente
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-500 text-white rounded-2xl px-3 py-1 flex items-center gap-1">
      <X size={14} className="inline" /> Inactivo
    </Badge>
  );
};

export default TrafficManagerBadge;
