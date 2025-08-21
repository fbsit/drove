
import React from "react";
import { Car, Calendar } from "lucide-react";

const EnProgresoDrover: React.FC = ({
  travels = [],
}) => (
  <div className="max-w-2xl mx-auto py-6">
    <h1 className="text-2xl mb-6" style={{ fontFamily: "Montserrat", fontWeight: "bold", color: "white" }}>
      Viaje en Progreso
    </h1>
    {travels.length === 0 ? (
      <div className="text-white/70">No tienes viajes actualmente en curso.</div>
    ) : (
      <div className="space-y-4">
        {travels.map((t) => (
          <div key={t.id} className="flex items-center bg-white/10 rounded-2xl p-4 gap-4">
            <Car className="text-[#6EF7FF]" size={28} />
            <div className="flex-1">
              <div className="flex flex-row flex-wrap gap-x-2 items-center mb-1">
                <span className="font-bold text-white" style={{ fontFamily: "Montserrat" }}>
                  {t.from} &rarr; {t.to}
                </span>
                <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                  En Progreso
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Calendar size={16} />
                {t.fecha}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default EnProgresoDrover;

