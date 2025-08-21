
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

// Props tipadas para reuso futuro
interface Props {
  nombre: string;
  foto?: string;
}

export const DroverInfoCard: React.FC<Props> = ({ nombre, foto }) => {
  // Inicial para fallback
  const initial = nombre?.[0]?.toUpperCase() || "D";
  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#6EF7FF]/15 rounded-2xl p-5 shadow-lg flex items-center gap-4 transition hover:scale-[1.01] hover:shadow-xl">
      <Avatar className="w-16 h-16 border-2 border-[#6EF7FF]/70 shadow">
        {foto ? (
          <AvatarImage src={foto} alt={`Foto de ${nombre}`} />
        ) : (
          <AvatarFallback className="bg-[#6EF7FF]/70 text-[#22142A] text-2xl font-bold">{initial}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <div className="text-[#22142A] font-bold text-lg mb-1" style={{ fontFamily: "Helvetica Bold" }}>
          Drover asignado
        </div>
        <div className="flex items-center text-base text-[#22142A] font-bold gap-2">
          <User size={18} className="text-[#6EF7FF]" />
          <span>{nombre}</span>
        </div>
        {/* Aquí podrías agregar más detalles (calificación, contacto, etc.) si están disponibles */}
      </div>
    </div>
  );
};
