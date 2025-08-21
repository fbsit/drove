
import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import {
  // Lucide icons permitidos para navegación
  BarChart,
  Users,
  FileText,
  Euro,
  Truck,
  Gauge, // Cambia Dashboard por Gauge
  ArrowLeft,
  Car,
  Briefcase,
  Star,
  MessageSquare,
} from "lucide-react";

// Menú admin tipo premium con experiencia gamificable DOve/Uber
const adminNav = [
  {
    label: "Dashboard",
    desc: "Panel principal",
    to: "/admin/dashboard",
    icon: Gauge, // Antes Dashboard (no existe), usa Gauge
  },
  {
    label: "Clientes",
    desc: "Gestión de clientes",
    to: "/admin/clientes",
    icon: Users,
  },
  {
    label: "Drovers",
    desc: "Gestión de drovers",
    to: "/admin/drovers",
    icon: Car, // Cambiado de Users a Car
  },
  {
    label: "Jefes de Tráfico",
    desc: "Gestión de jefes",
    to: "/admin/jefes-trafico",
    icon: Briefcase, // Cambiado de Users a Briefcase
  },
  {
    label: "Traslados",
    desc: "Gestión de traslados",
    to: "/admin/traslados",
    icon: Truck,
  },
  {
    label: "Facturas",
    desc: "Gestión de facturas",
    to: "/admin/facturas", // <-- Corrección aquí
    icon: Euro,
  },
  {
    label: "Reseñas",
    desc: "Gestión de reseñas",
    to: "/admin/resenas",
    icon: Star, // Nueva sección agregada
  },
  {
    label: "Soporte",
    desc: "Tickets de soporte",
    to: "/admin/soporte",
    icon: MessageSquare, // Nueva sección agregada
  },
  {
    label: "Reportes",
    desc: "Análisis y reportes",
    to: "/admin/reportes",
    icon: BarChart,
  },
];

// Item menú ultra visual, botones premium, highlight activo, descripción, bolita digital
function MenuProItem({ to, icon: Icon, label, desc, active, onClick }: {
  to: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-5 py-3 mb-3 last:mb-0
        rounded-2xl transition-all shadow-lg border
        ${active
          ? "bg-[#9efffa] border-[#7eebd8] text-[#22142A]"
          : "bg-white/5 border-transparent text-white hover:bg-[#3acea722] hover:border-[#3acea7] hover:text-[#3acea7]"}
        relative group
      `}
      style={{
        fontFamily: "Helvetica",
        minHeight: 62,
        cursor: "pointer"
      }}
      onClick={onClick}
    >
      <div className={`
        rounded-xl flex items-center justify-center
        w-12 h-12 transition
        ${active
          ? "bg-[#d9fdff] text-[#22142A]"
          : "bg-[#232938] text-[#6EF7FF] group-hover:bg-[#22343b]/80"}
        shadow
      `}>
        <Icon size={26} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`font-bold text-base ${active ? "text-[#22142A]" : "text-white"}`}>{label}</span>
        <span className={`text-xs mt-0.5 ${active ? "text-[#242b3c]" : "text-white/70"}`}>{desc}</span>
      </div>
      {/* Bolita activa */}
      {active && (
        <span className="absolute top-3 right-4 w-2 h-2 bg-[#3acea7] rounded-full" />
      )}
    </Link>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

const MobileAdminSheet: React.FC<Props> = ({ open, onOpenChange }) => {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={`
          p-0 bg-gradient-to-tr from-[#1e1532] via-[#241536] to-[#292244]
          rounded-t-2xl w-full max-w-full md:hidden border-none
          shadow-2xl border-t-4 border-[#6EF7FF30] z-[1200]
          flex flex-col
        `}
        style={{
          fontFamily: "Helvetica",
          minHeight: "65vh",
          boxShadow: "0 -18px 70px #16131fa0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        {/* Drag bar */}
        <div className="w-full flex justify-center items-center py-4 select-none">
          <div className="w-14 h-2 bg-white/20 rounded-full"></div>
        </div>
        {/* Cabecera menú */}
        <div className="w-full px-7 pb-3 mb-1">
          <div className="flex items-center gap-3">
            <Gauge size={25} className="text-[#6EF7FF]" /> {/* Remplazado Dashboard por Gauge */}
            <div>
              <span className="block font-bold text-lg text-white leading-tight">Navegación</span>
              <span className="block text-xs text-white/60 leading-tight">Ir a sección del sistema</span>
            </div>
          </div>
        </div>

        {/* Menú principal */}
        <nav className="flex flex-col gap-0 px-2">
          {adminNav.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <MenuProItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                active={isActive}
                onClick={() => onOpenChange(false)}
              />
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Botón cerrar grande centrado + texto */}
        <div className="w-full flex flex-col items-center pb-9 mt-4">
          <button
            aria-label="Cerrar menú"
            onClick={() => onOpenChange(false)}
            className={`
              flex items-center justify-center rounded-full
              bg-[#b9f8ff] hover:bg-[#6EF7FF] shadow-2xl
              w-14 h-14 
              border-4 border-[#6EF7FF55]
              active:scale-95 transition-all
            `}
            style={{
              fontFamily: "Helvetica",
              boxShadow: "0 6px 36px #6EF7FF33,0 2px 8px #16131fa0"
            }}
          >
            <ArrowLeft size={28} color="#22142A" />
          </button>
          <span className="mt-4 text-white/60 text-sm select-none">Toca para cerrar</span>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileAdminSheet;
