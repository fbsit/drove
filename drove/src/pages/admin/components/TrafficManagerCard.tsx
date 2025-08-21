import React from "react";
import { Edit, Mail, Trash2, X, Check } from "lucide-react";
import TrafficManagerBadge from "./TrafficManagerBadge";

/**
 * Propiedades del Jefe de Tráfico
 */
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
  manager: TrafficManager;
  onEdit: (manager: TrafficManager) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onResendInvite: (id: string) => void;
  onDelete: (id: string) => void;
}

const TrafficManagerCard: React.FC<Props> = ({
  manager,
  onEdit,
  onActivate,
  onDeactivate,
  onResendInvite,
  onDelete,
}) => {
  // Detecta mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    return (
      <div
        className="bg-[#291a38] border border-white/10 rounded-2xl px-4 py-3 mb-3 shadow flex flex-col w-full max-w-[430px] mx-auto"
        style={{
          minWidth: 0,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Fila principal: Nombre, estado, opciones */}
        <div className="flex items-start justify-between gap-2 w-full min-w-0">
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div
              className="text-white font-bold text-base truncate"
              style={{ fontFamily: "Helvetica", letterSpacing: "-0.01em" }}
              title={manager.name}
            >
              {manager.name}
            </div>
            <div
              className="text-white/70 text-xs truncate"
              style={{ fontFamily: "Helvetica" }}
              title={manager.email}
            >
              {manager.email}
            </div>
          </div>
          {/* Estado (badge) */}
          <div className="ml-2 flex-shrink-0 flex items-center">
            <TrafficManagerBadge active={manager.active} invited={manager.invited} />
          </div>
        </div>
        {/* Acciones y métricas (fila inferior) */}
        <div className="flex items-end justify-between mt-2 gap-2 w-full">
          {/* Métricas */}
          <div className="text-xs text-white/60 flex flex-col pl-0.5" style={{ fontFamily: "Helvetica" }}>
            <span className="truncate" title={`Traslados asignados: ${manager.assignedTransfers}`}>
              <b>{manager.assignedTransfers}</b> traslados
            </span>
            <span className="truncate" title={new Date(manager.createdAt).toLocaleDateString("es-ES")}>
              <span className="opacity-70">Creado:</span> {new Date(manager.createdAt).toLocaleDateString("es-ES")}
            </span>
          </div>
          {/* Acciones */}
          <div className="flex gap-0.5 ml-auto">
            <button
              className="p-2 rounded-full hover:bg-[#6EF7FF22] text-[#6EF7FF] transition-colors"
              title="Editar"
              onClick={() => onEdit(manager)}
            >
              <Edit size={18} />
            </button>
            {manager.active ? (
              <button
                className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
                title="Desactivar"
                onClick={() => onDeactivate(manager.id)}
              >
                <X size={18} />
              </button>
            ) : (
              <button
                className="p-2 rounded-full hover:bg-green-500/10 text-green-400 transition-colors"
                title="Activar"
                onClick={() => onActivate(manager.id)}
              >
                <Check size={18} />
              </button>
            )}
            {manager.invited && !manager.active && (
              <button
                className="p-2 rounded-full hover:bg-[#6EF7FF22] text-[#6EF7FF] transition-colors"
                title="Reenviar invitación"
                onClick={() => onResendInvite(manager.id)}
              >
                <Mail size={18} />
              </button>
            )}
            <button
              className="p-2 rounded-full hover:bg-white/15 text-white transition-colors"
              title="Eliminar"
              onClick={() => onDelete(manager.id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: igual que antes (mantenemos versión original)
  return (
    <div
      className={`bg-[#291a38] border border-white/10 rounded-2xl p-4 mb-4 shadow flex flex-col gap-2`}
      style={{
        maxWidth: "480px",
        minWidth: 0,
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
        alignSelf: "center",
        boxShadow: "0 2px 20px #0007"
      }}
    >
      {/* Fila de nombre, email, estado y acciones igual a versión anterior */}
      <div className="flex items-start gap-3 flex-nowrap w-full" style={{ minWidth: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="text-white font-semibold text-lg" style={{ fontFamily: "Helvetica", overflowWrap: "break-word" }}>
            {manager.name}
          </div>
          <div className="text-white/70 text-sm" style={{ fontFamily: "Helvetica", overflowWrap: "break-word" }}>
            {manager.email}
          </div>
          <div className="mt-1">
            <TrafficManagerBadge active={manager.active} invited={manager.invited} />
          </div>
        </div>
        <div className="ml-auto flex gap-1 flex-shrink-0">
          <button
            className="p-2 rounded-full hover:bg-[#6EF7FF22] text-[#6EF7FF] transition-colors"
            title="Editar"
            onClick={() => onEdit(manager)}
          >
            <Edit size={18} />
          </button>
          {manager.active ? (
            <button
              className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
              title="Desactivar"
              onClick={() => onDeactivate(manager.id)}
            >
              <X size={18} />
            </button>
          ) : (
            <button
              className="p-2 rounded-full hover:bg-green-500/10 text-green-400 transition-colors"
              title="Activar"
              onClick={() => onActivate(manager.id)}
            >
              <Check size={18} />
            </button>
          )}
          {manager.invited && !manager.active && (
            <button
              className="p-2 rounded-full hover:bg-[#6EF7FF22] text-[#6EF7FF] transition-colors"
              title="Reenviar invitación"
              onClick={() => onResendInvite(manager.id)}
            >
              <Mail size={18} />
            </button>
          )}
          <button
            className="p-2 rounded-full hover:bg-white/15 text-white transition-colors"
            title="Eliminar"
            onClick={() => onDelete(manager.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1 text-sm text-white/70" style={{ fontFamily: "Helvetica", flexWrap: "wrap" }}>
        <span className="whitespace-nowrap"><b>Traslados:</b> {manager.assignedTransfers}</span>
        <span className="ml-2 whitespace-nowrap opacity-70"><b>Creado:</b> {new Date(manager.createdAt).toLocaleDateString("es-ES")}</span>
      </div>
    </div>
  );
};

export default TrafficManagerCard;
