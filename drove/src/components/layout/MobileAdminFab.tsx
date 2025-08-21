
import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClick: () => void;
}

const MobileAdminFab: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Abrir panel de administración"
    className={cn(
      "fixed z-[1100] left-1/2 -translate-x-1/2 bottom-7 md:hidden flex items-center justify-center",
      "rounded-full shadow-2xl bg-[#6EF7FF] hover:bg-[#32dfff]",
      "w-16 h-16 transition-all duration-200",
      "hover:shadow-[0_0_32px_8px_#6EF7FFCC] hover:scale-105 active:scale-95",
      "focus:outline-none animate-fab-glow",
      "border-4 border-white/30"
    )}
    style={{
      boxShadow: "0 4px 32px #6EF7FFBB, 0 2px 6px #0007",
      fontFamily: "Helvetica",
      bottom: 28,
    }}
  >
    <span className="fab-pulse-icon">
      <Zap size={34} color="#22142A" strokeWidth={2.9} />
    </span>
    <style>
      {`
        @keyframes fabGlow {
          0%, 100% { box-shadow: 0 4px 32px #6EF7FFBB, 0 2px 6px #0007; }
          60% { box-shadow: 0 0 50px 15px #6EF7FFDD, 0 2px 6px #0004; }
        }
        .animate-fab-glow {
          animation: fabGlow 1.7s infinite alternate;
        }
        .fab-pulse-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulseRay 1.9s infinite cubic-bezier(.42,0,1,1);
        }
        @keyframes pulseRay {
          0%, 100% { filter: drop-shadow(0 0 6px #6ef7ff) }
          50% { filter: drop-shadow(0 0 22px #6ef7ff88) }
        }
      `}
    </style>
  </button>
);

export default MobileAdminFab;
