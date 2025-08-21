
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DroverSupportChatFab from "@/components/layout/DroverSupportChatFab";
import { MessageCircle } from "lucide-react";

// Widget dedicado al chat de soporte: solo acceso directo al chat
const SupportInfo = () => (
  <div className="w-full max-w-lg mx-auto bg-white/10 rounded-2xl p-6 text-white mt-6 shadow-lg text-center">
    <h2 className="font-montserrat font-bold text-xl mb-2">Centro de Soporte</h2>
    <p className="mb-4 text-white/80">
      ¿Tienes dudas, necesitas asistencia o resolver una incidencia? Nuestro equipo está disponible por chat para ayudarte en todo momento.
    </p>
    <div className="flex flex-col items-center gap-3">
      <div className="bg-[#6EF7FF] rounded-full w-16 h-16 flex items-center justify-center shadow-xl mb-2 animate-fab-glow">
        <MessageCircle size={36} color="#22142A" strokeWidth={2.6} />
      </div>
      <span className="block text-white/80 font-semibold">
        Pulsa el botón de chat abajo a la derecha para iniciar la conversación.
      </span>
    </div>
    <style>
      {`
        @keyframes fabGlow {
          0%, 100% { box-shadow: 0 4px 32px #6EF7FFBB, 0 2px 6px #0007; }
          60% { box-shadow: 0 0 50px 15px #6EF7FFDD, 0 2px 6px #0004; }
        }
        .animate-fab-glow {
          animation: fabGlow 1.7s infinite alternate;
        }
      `}
    </style>
  </div>
);

const SoportePage = () => (
  <DashboardLayout>
    <div className="pt-5 text-center">
      <h1 className="font-montserrat font-bold text-3xl text-white mb-2">Soporte</h1>
      <p className="text-white/70 mb-6">Estamos aquí para ayudarte vía chat.</p>
      <SupportInfo />
    </div>
    {/* FAB de chat de soporte SOLO escritorio y solo para roles drover o cliente */}
    <DroverSupportChatFab />
  </DashboardLayout>
);

export default SoportePage;
