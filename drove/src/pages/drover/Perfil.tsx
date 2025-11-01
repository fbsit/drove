
import React from "react";
import { User } from "lucide-react";
import MobileDroverFooterNav from '@/components/layout/MobileDroverFooterNav';

const PerfilDrover: React.FC = () => (
  <div className="max-w-xl mx-auto py-8 pb-20">
    <h1 className="text-2xl mb-6" style={{ fontFamily: "Montserrat", fontWeight: "bold", color: "white" }}>
      Perfil del Drover
    </h1>
    <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center shadow">
      <div className="w-20 h-20 rounded-full bg-[#6EF7FF] flex items-center justify-center mb-3 shadow-lg">
        <User size={48} className="text-[#22142A]" />
      </div>
      <div className="text-white font-bold text-xl mb-1" style={{ fontFamily: "Montserrat" }}>Nombre Apellido</div>
      <div className="text-white/80 mb-3">drover@email.com</div>
      <div className="w-full flex flex-col gap-2 mt-4">
        <div className="flex justify-between text-white/90">
          <span className="font-semibold">Estado:</span>
          <span className="text-green-400 font-bold">Activo</span>
        </div>
        <div className="flex justify-between text-white/90">
          <span className="font-semibold">Teléfono:</span>
          <span className="">+34 600 000 000</span>
        </div>
        <div className="flex justify-between text-white/90">
          <span className="font-semibold">Licencia:</span>
          <span className="">B (Valida)</span>
        </div>
        <div className="flex justify-between text-white/90">
          <span className="font-semibold">Calificación:</span>
          <span className="">4.8 ⭐</span>
        </div>
      </div>
    </div>
    <MobileDroverFooterNav />
  </div>
);

export default PerfilDrover;

