
import React from "react";
import { Users, UserCheck, MailCheck } from "lucide-react";

interface Props {
  total: number;
  activos: number;
  invitados: number;
}

const boxStyle =
  "flex items-center gap-3 bg-white/10 shadow-lg rounded-2xl px-4 py-4 w-full min-w-[110px] justify-center hover:scale-105 transition-transform duration-150 animate-fade-in";

const iconStyle = "p-2 rounded-xl bg-[#6EF7FF]/30 flex items-center justify-center";

const TrafficManagersMetrics: React.FC<Props> = ({ total, activos, invitados }) => (
  <div className="w-full flex flex-col sm:flex-row gap-4 mb-6 mt-2">
    <div className={boxStyle}>
      <span className={iconStyle}><Users size={26} className="text-[#6EF7FF]" /></span>
      <div>
        <div className="font-bold text-lg text-white" style={{ fontFamily: "Helvetica" }}>{total}</div>
        <div className="text-xs text-white/80" style={{ fontFamily: "Helvetica" }}>Total</div>
      </div>
    </div>
    <div className={boxStyle}>
      <span className={iconStyle}><UserCheck size={26} className="text-green-400" /></span>
      <div>
        <div className="font-bold text-lg text-white" style={{ fontFamily: "Helvetica" }}>{activos}</div>
        <div className="text-xs text-white/80" style={{ fontFamily: "Helvetica" }}>Activos</div>
      </div>
    </div>
    <div className={boxStyle}>
      <span className={iconStyle}><MailCheck size={26} className="text-blue-400" /></span>
      <div>
        <div className="font-bold text-lg text-white" style={{ fontFamily: "Helvetica" }}>{invitados}</div>
        <div className="text-xs text-white/80" style={{ fontFamily: "Helvetica" }}>Invitaciones</div>
      </div>
    </div>
  </div>
);

export default TrafficManagersMetrics;
