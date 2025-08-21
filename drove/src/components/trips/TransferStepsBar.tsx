
import React from "react";
import { UserCheck, Check, Clock, Car, CheckCheck } from "lucide-react";

// Definición de los pasos y sus iconos mejorados para el servicio de traslado
const STEPS = [
  {
    key: "asignado",
    label: "Asignado",
    icon: UserCheck, // Usuario con check - drover asignado
  },
  {
    key: "PICKED_UP",
    label: "Recogida",
    icon: Check, // Check simple - vehículo recogido
  },
  {
    key: "en_progreso",
    label: "En traslado",
    icon: Clock, // Reloj - en camino
  },
  {
    key: "entrega",
    label: "Entrega",
    icon: Car, // Coche - entrega del vehículo
  },
  {
    key: "completado",
    label: "Completado",
    icon: CheckCheck, // Doble check - completado exitosamente
  },
];

// Mapeo de estado API/UI a paso de la barra
function getCurrentStep(status: string) {
  switch (status?.toLowerCase()) {
    case "asignado":
      return 0;
    case "picked_up":
      return 1;
    case "in_progress":
      return 2;
    case "request_finish":
      return 3;
    case "delivered":
      return 4;
    case "pendiente":
      return 0;
    case "cancelado":
      return 0;
    default:
      return 0;
  }
}

// Función para obtener el label del estado actual
export function getStatusLabel(status: string): string {
  const stepIndex = getCurrentStep(status);
  return STEPS[stepIndex]?.label || "Asignado";
}

interface TransferStepsBarProps {
  trip: any;
}

const TransferStepsBar: React.FC<TransferStepsBarProps> = ({ trip }) => {
  const currentStep = getCurrentStep(trip?.status);
  return (
    <div className="w-full flex flex-col items-center py-1 md:py-4 animate-fade-in">
      <div className="w-full max-w-2xl relative">
        {/* Vista móvil - Solo estado actual con icono */}
        <div className="block md:hidden">
          <div className="flex flex-col items-center">
            {(() => {
              const step = STEPS[currentStep];
              const Icon = step.icon;
              return (
                <>
                  <div
                    className="flex items-center justify-center rounded-full border-2 bg-[#6EF7FF] border-[#6EF7FF] text-[#22142A] shadow-xl"
                    style={{
                      width: 50,
                      height: 50,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    className="mt-2 text-sm font-bold text-[#6EF7FF]"
                    style={{
                      fontFamily: "Helvetica Bold",
                    }}
                  >
                    {step.label}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Vista desktop - Todos los estados con iconos */}
        <div className="hidden md:block">
          <div className="flex flex-row items-center justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={
                      `flex items-center justify-center rounded-full border-2 ` +
                      (isCompleted
                        ? "bg-[#6EF7FF] border-[#6EF7FF] text-[#22142A]"
                        : isActive
                        ? "bg-white text-[#22142A] border-[#6EF7FF] shadow-xl"
                        : "bg-white/10 border-white/20 text-white/60")
                    }
                    style={{
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className={
                      "mt-2 text-xs font-bold " +
                      (isActive
                        ? "text-[#6EF7FF]"
                        : isCompleted
                        ? "text-white"
                        : "text-white/50")
                    }
                    style={{
                      fontFamily: isActive ? "Helvetica Bold" : "Helvetica",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Líneas de conexión - solo en desktop */}
          <div className="absolute top-5 left-0 w-full flex justify-between px-5" style={{ zIndex: -1 }}>
            {STEPS.slice(0, -1).map((_, idx) => (
              <div
                key={idx}
                className={
                  "h-1 rounded-full flex-1 mx-2 " +
                  (idx < currentStep ? "bg-[#6EF7FF]" : "bg-white/20")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferStepsBar;
