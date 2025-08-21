
import React from "react";
import { Car, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface KpiCardsClienteProps {
  totalTransfers: number;
  avgPrice: number;
}

const formatEuro = (val: number) =>
  val.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

const KpiCardsCliente: React.FC<KpiCardsClienteProps> = ({
  totalTransfers, avgPrice
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`w-full grid grid-cols-1 sm:grid-cols-2 gap-3 ${isMobile ? 'mb-3' : 'mb-5'}`}>
      {/* Traslados solicitados */}
      <div className={`bg-[#312040] rounded-2xl flex flex-col items-center shadow-xl border border-white/10 ${
        isMobile ? 'p-3' : 'p-5'
      }`}>
        <Car size={isMobile ? 24 : 28} className="text-[#6EF7FF] mb-2" />
        <span className={`text-white font-bold font-helvetica ${isMobile ? 'text-xl' : 'text-2xl'}`}>{totalTransfers}</span>
        <span className={`text-white/70 mt-1 font-montserrat text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>Traslados solicitados</span>
      </div>
      {/* Coste promedio */}
      <div className={`bg-[#312040] rounded-2xl flex flex-col items-center shadow-xl border border-white/10 ${
        isMobile ? 'p-3' : 'p-5'
      }`}>
        <BarChart2 size={isMobile ? 24 : 28} className="text-[#6EF7FF] mb-2" />
        <span className={`text-white font-bold font-helvetica ${isMobile ? 'text-xl' : 'text-2xl'}`}>{formatEuro(avgPrice)}</span>
        <span className={`text-white/70 mt-1 font-montserrat text-center ${isMobile ? 'text-xs' : 'text-xs'}`}>Coste medio traslado</span>
      </div>
    </div>
  );
};

export default KpiCardsCliente;
