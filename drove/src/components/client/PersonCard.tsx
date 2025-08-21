
import React from "react";
import { User } from "lucide-react";

interface PersonCardProps {
  tipo: "Remitente" | "Receptor";
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  tipo,
  nombre,
  dni,
  email,
  telefono,
}) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-[#6EF7FF]/10 shadow-xl transition hover:scale-[1.01] hover:shadow-2xl">
    <div className="flex items-center gap-2 pb-3 border-b border-[#22142A]/10 mb-4">
      <User className="text-[#6EF7FF]" size={18} />
      <span className="text-[#22142A] font-bold text-lg" style={{ fontFamily: "Helvetica Bold" }}>
        {tipo}
      </span>
    </div>
    <div className="text-[#22142A] font-bold text-md">{nombre}</div>
    <div className="text-[#22142A]/80 text-xs mb-1">{dni}</div>
    <div className="flex flex-col text-xs text-[#22142A]/70 gap-0.5">
      <span>{email}</span>
      <span>{telefono}</span>
    </div>
  </div>
);
