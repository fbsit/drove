import React from "react";

type DroverEstado = "aprobado" | "pendiente" | "rechazado";
type DroverTipo = "core" | "flex";

export interface DroverCardProps {
  drover: {
    id: number;
    nombre: string;
    email: string;
    avatar?: string;
    estado: DroverEstado;
    traslados: number;
    calificacion: number;
    tiempo: string;
    tipoDrover: DroverTipo; // core = CONTRACTED, flex = FREELANCE
  };
  onClickPerfil?: () => void;
}

// Badge visual igual que cards de cliente
const estadoBadge = (estado: DroverEstado) => {
  switch (estado) {
    case "aprobado":
      return (
        <span className="bg-emerald-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
          Aprobado
        </span>
      );
    case "rechazado":
      return (
        <span className="bg-rose-700 text-white rounded-full px-2 py-0.5 text-xs font-bold">
          Rechazado
        </span>
      );
    case "pendiente":
      return (
        <span className="bg-amber-500 text-black rounded-full px-2 py-0.5 text-xs font-bold">
          Pendiente
        </span>
      );
    default:
      return null;
  }
};

// Badge del tipo de drover
const tipoDroverBadge = (tipo: DroverTipo) => {
  if (tipo === "core") {
    return (
      <span
        className="inline-flex items-center gap-1 border border-[#284c8e] bg-[#193268] px-2 py-0.5 rounded-xl text-xs font-bold"
        style={{
          color: "#6EF7FF",
          fontFamily: "Helvetica",
          letterSpacing: 0.5,
        }}
        title="Contratado por Drove"
      >
        {/* Puedes cambiar el icono si quieres */}
        <span
          className="text-white font-helvetica"
          style={{ textShadow: "0 1px 2px #0008" }}
        >
          DROVER
        </span>
        <span style={{ color: "#6EF7FF", fontWeight: 700, marginLeft: 2 }}>
          Core
        </span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 border border-[#40ea8e] bg-[#106b49] px-2 py-0.5 rounded-xl text-xs font-bold"
      style={{ color: "#52ff99", fontFamily: "Helvetica", letterSpacing: 0.5 }}
      title="Autónomo (Flex)"
    >
      <span
        className="text-white font-helvetica"
        style={{ textShadow: "0 1px 2px #0008" }}
      >
        DROVER
      </span>
      <span style={{ color: "#52ff99", fontWeight: 700, marginLeft: 2 }}>
        Flex
      </span>
    </span>
  );
};

const DroverCard: React.FC<DroverCardProps> = ({ drover, onClickPerfil }) => (
  <div className="bg-[#1A1F2C] rounded-2xl p-5 flex flex-col items-center transition-all hover:-translate-y-1 duration-150">
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 text-3xl font-bold uppercase ${
        drover.avatar ? "" : "bg-[#6ef7ff]/70 text-[#22142A]"
      } overflow-hidden`}
    >
      {drover.avatar ? (
        <img
          src={drover.avatar}
          alt={drover.nombre}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        drover.nombre?.charAt(0)
      )}
    </div>
    <div
      className="font-bold text-white text-md text-center mb-1"
      style={{ fontFamily: "Helvetica" }}
    >
      {drover.nombre}
    </div>
    {/* TYPE BADGE */}
    <div className="my-1">{tipoDroverBadge(drover.tipoDrover)}</div>
    <div className="mt-1">
      <span className="text-white/70 text-xs">{drover.email}</span>
    </div>
    <div className="mt-2">{estadoBadge(drover.estado)}</div>
    <div className="flex flex-col items-center gap-1 text-white/60 text-xs mt-2 mb-2">
      <div>
        <b>{drover.traslados}</b> traslados
      </div>
      <div>
        ⭐ {drover.calificacion} | <span>Promedio {drover.tiempo}</span>
      </div>
    </div>
    <button
      className="bg-[#6ef7ff] text-[#22142A] font-bold px-4 py-1.5 rounded-2xl text-sm mt-auto hover:bg-[#57e6f2]"
      onClick={onClickPerfil}
      style={{ fontFamily: "Helvetica" }}
    >
      Ver perfil
    </button>
  </div>
);

export default DroverCard;
