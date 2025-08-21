import React from "react";
import { Edit, X, Check, Mail, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TrafficManagerBadge from "./TrafficManagerBadge";
import TrafficManagerCard from "./TrafficManagerCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TrafficManager {
  id: string;
  name: string;
  email: string;
  active: boolean;
  invited: boolean;
  createdAt: string;
  assignedTransfers: number;
}

interface Props {
  managers: TrafficManager[];
  onEdit: (manager: TrafficManager) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onResendInvite: (id: string) => void;
  onDelete: (id: string) => void;
}

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

const TrafficManagerTable: React.FC<Props> = ({
  managers,
  onEdit,
  onActivate,
  onDeactivate,
  onResendInvite,
  onDelete,
}) => {
  if (!managers || managers.length === 0) return null;

  // Responsive: cards en mobile, tabla en desktop
  if (isMobile()) {
    return (
      <div className="flex flex-col gap-3 w-full" style={{
        overflowX: "hidden", // previene scroll lateral
        boxSizing: "border-box"
      }}>
        {managers.map((tm) => (
          <div key={tm.id} className="w-full flex justify-center" style={{ minWidth: 0 }}>
            {/* asegura que cada card no sobrepasa el ancho */}
            <TrafficManagerCard
              manager={tm}
              onEdit={onEdit}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onResendInvite={onResendInvite}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <table className="min-w-full w-full text-left text-sm table-auto">
      <thead>
        <tr className="border-b border-white/10">
          <th className="py-2 px-3 text-white font-bold">Nombre</th>
          <th className="py-2 px-3 text-white font-bold">Email</th>
          <th className="py-2 px-3 text-white font-bold">Estado</th>
          <th className="py-2 px-3 text-white font-bold">Fecha creación</th>
          <th className="py-2 px-3 text-white font-bold text-center">Traslados asignados</th>
          <th className="py-2 px-3 text-white font-bold text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {managers.map((tm) => (
          <tr key={tm.id} className="hover:bg-white/5 transition">
            <td className="py-2 px-3 font-medium text-white">{tm.name}</td>
            <td className="py-2 px-3 text-white">{tm.email}</td>
            <td className="py-2 px-3">
              <TrafficManagerBadge active={tm.active} invited={tm.invited} />
            </td>
            <td className="py-2 px-3 text-white">
              {new Date(tm.createdAt).toLocaleDateString("es-ES")}
            </td>
            <td className="py-2 px-3 text-center text-white">{tm.assignedTransfers}</td>
            <td className="py-2 px-3 text-right">
              <div className="flex items-center gap-2 justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      title="Editar usuario"
                      className="p-1.5 rounded-full hover:bg-white/10 text-[#6EF7FF] transition-colors"
                      onClick={() => onEdit(tm)}
                    >
                      <Edit size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Editar usuario</TooltipContent>
                </Tooltip>
                {tm.active ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        title="Desactivar usuario"
                        className="p-1.5 rounded-full hover:bg-white/10 text-red-500 transition-colors"
                        onClick={() => onDeactivate(tm.id)}
                      >
                        <X size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Desactivar usuario</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        title="Activar usuario"
                        className="p-1.5 rounded-full hover:bg-white/10 text-green-500 transition-colors"
                        onClick={() => onActivate(tm.id)}
                      >
                        <Check size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Activar usuario</TooltipContent>
                  </Tooltip>
                )}
                {tm.invited && !tm.active && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        title="Reenviar invitación"
                        className="p-1.5 rounded-full hover:bg-white/10 text-[#6EF7FF] transition-colors"
                        onClick={() => onResendInvite(tm.id)}
                      >
                        <Mail size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Reenviar invitación</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      title="Eliminar usuario"
                      className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                      onClick={() => onDelete(tm.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar usuario</TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TrafficManagerTable;
