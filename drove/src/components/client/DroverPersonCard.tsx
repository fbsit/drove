
import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DroverPersonCardProps {
  nombre: string;
  foto?: string;
}

export const DroverPersonCard: React.FC<DroverPersonCardProps> = ({ nombre, foto }) => {
  const initial = nombre?.[0]?.toUpperCase() || "D";
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-[#6EF7FF]/10 shadow-xl transition hover:scale-[1.01] hover:shadow-2xl flex gap-4 items-center">
      <Avatar className="w-12 h-12 border-2 border-[#6EF7FF]/70 shadow">
        {foto ? (
          <AvatarImage src={foto} alt={`Foto de ${nombre}`} />
        ) : (
          <AvatarFallback className="bg-[#6EF7FF]/70 text-[#22142A] text-lg font-bold">
            {initial}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <User className="text-[#6EF7FF]" size={18} />
          <span className="text-[#22142A] font-bold text-lg" style={{ fontFamily: "Helvetica Bold" }}>Drover asignado</span>
        </div>
        <div className="text-[#22142A] text-md font-bold">{nombre}</div>
      </div>
    </div>
  );
};
