
import React from "react";
import { BadgeCheck } from "lucide-react";

export type EstadoCliente = "pendiente" | "aprobado" | "rechazado";
export type TipoCliente = "empresa" | "persona";

export interface Client {
  id: number;
  nombre: string;
  tipo: TipoCliente;
  estado: EstadoCliente;
  email: string;
  fecha: string;
  avatar?: string; // url o undefined
}

const estadoBadge = (estado: EstadoCliente) => {
  switch (estado) {
    case "aprobado":
      return <span className="bg-emerald-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">Aprobado</span>;
    case "rechazado":
      return <span className="bg-rose-700 text-white rounded-full px-2 py-0.5 text-xs font-bold">Rechazado</span>;
    case "pendiente":
      return <span className="bg-amber-500 text-black rounded-full px-2 py-0.5 text-xs font-bold">Pendiente</span>;
    default:
      return null;
  }
};

const tipoBadge = (tipo: TipoCliente) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${tipo === "empresa" ? "bg-teal-800 text-white" : "bg-[#6ef7ff] text-[#22142A]"
    }`}>
    {tipo === "empresa" ? "Empresa" : "Persona natural"}
  </span>
);

const ClientCard: React.FC<{ client: Client, onClickPerfil?: () => void }> = ({ client, onClickPerfil }) => (
  <div className="bg-[#1A1F2C] rounded-2xl shadow-lg p-5 flex flex-col items-center transition-all hover:-translate-y-1 duration-150">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 text-3xl font-bold uppercase ${client.avatar
      ? ""
      : "bg-[#6ef7ff]/70 text-[#22142A]"
      } overflow-hidden`}>
      {client.avatar
        ? <img src={client.avatar} alt={client.nombre} className="w-full h-full rounded-full object-cover" />
        : client.nombre?.charAt(0)
      }
    </div>
    <div className="font-bold text-white text-md text-center mb-1" style={{ fontFamily: "Helvetica" }}>
      {client.nombre}
    </div>
    {tipoBadge(client.tipo)}
    <div className="mt-2">{estadoBadge(client.estado)}</div>
    <div className="text-white/60 text-xs mt-1 mb-2">{client.fecha}</div>
    <button
      className="bg-[#6ef7ff] text-[#22142A] font-bold px-4 py-1.5 rounded-2xl text-sm mt-auto hover:bg-[#57e6f2]"
      onClick={onClickPerfil}
      style={{ fontFamily: "Helvetica" }}
    >
      Ver perfil
    </button>
  </div>
);

export default ClientCard;
