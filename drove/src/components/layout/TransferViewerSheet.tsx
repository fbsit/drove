
import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Gauge, Users, Car, Calendar, BarChart2, X, Navigation2, Briefcase, Euro } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const getNavigationItems = (role: string | undefined) => {
  switch (role) {
    case "admin":
      return [
        { label: "Dashboard", to: "/admin/dashboard", icon: Gauge, description: "Panel principal" },
        { label: "Clientes", to: "/admin/clientes", icon: Users, description: "Gestión de clientes" },
        { label: "Jefes de Tráfico", to: "/admin/jefes-trafico", icon: Briefcase, description: "Gestión de jefes" },
        { label: "Drovers", to: "/admin/drovers", icon: Car, description: "Gestión de drovers" },
        { label: "Traslados", to: "/admin/traslados", icon: Calendar, description: "Gestión de traslados" },
        // Facturas integrado como tab en Traslados
        { label: "Reportes", to: "/admin/reportes", icon: BarChart2, description: "Análisis y reportes" },
      ];
    case "traffic_manager":
      return [
        { label: "Dashboard", to: "/trafico/dashboard", icon: Gauge, description: "Panel principal" },
        { label: "Traslados", to: "/trafico/traslados", icon: Calendar, description: "Gestión de traslados" },
        { label: "Asignaciones", to: "/trafico/asignaciones", icon: Car, description: "Asignar drovers" },
        { label: "Drovers", to: "/trafico/drivers", icon: Users, description: "Gestión de drovers" },
      ];
    case "client":
      return [
        { label: "Dashboard", to: "/cliente/dashboard", icon: Gauge, description: "Panel principal" },
        { label: "Mis Traslados", to: "/cliente/traslados", icon: Calendar, description: "Ver mis traslados" },
        { label: "Solicitar Traslado", to: "/solicitar-traslado", icon: Car, description: "Nuevo traslado" },
      ];
    case "drover":
      return [
        { label: "Dashboard", to: "/drover/dashboard", icon: Gauge, description: "Panel principal" },
        { label: "Traslados Asignados", to: "/drover/traslados", icon: Calendar, description: "Mis traslados" },
        { label: "En Progreso", to: "/drover/en-progreso", icon: Car, description: "Traslados activos" },
        { label: "Perfil", to: "/drover/perfil", icon: Users, description: "Mi perfil" },
      ];
    default:
      return [];
  }
};

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onNavigate: {
    vehicle: () => void;
    route: () => void;
    people: () => void;
    payment: () => void;
  };
}

const TransferViewerSheet: React.FC<Props> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigationItems = getNavigationItems(user?.role);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] rounded-t-3xl w-full max-w-full md:hidden z-[1200] border-none shadow-2xl border-t-4 border-[#6EF7FF]/40"
        style={{
          fontFamily: "Helvetica",
          minHeight: "65vh",
          boxShadow: "0 -20px 60px #6EF7FF20, 0 -8px 32px #16131f80",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        {/* Header con brillo */}
        <div className="flex items-center justify-center pt-6 pb-2 relative">
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#6EF7FF]/50 rounded-full"></div>
          <div className="flex items-center gap-3 mt-4">
            <div className="bg-[#6EF7FF]/20 p-2 rounded-xl">
              <Navigation2 size={24} className="text-[#6EF7FF]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl" style={{ fontFamily: "Helvetica" }}>
                Navegación
              </h2>
              <p className="text-white/60 text-sm">Ir a sección del sistema</p>
            </div>
          </div>
        </div>

        {/* Navegación con estilo gamificado */}
        <nav className="flex flex-col py-4 gap-3 px-6 flex-1">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#6EF7FF]/40 to-[#6EF7FF]/20 border-[#6EF7FF]/60' 
                    : 'bg-gradient-to-r from-white/10 to-white/5 hover:from-[#6EF7FF]/30 hover:to-[#6EF7FF]/10 border-white/20 hover:border-[#6EF7FF]/50'
                  } 
                  border hover:shadow-[0_0_30px_#6EF7FF40] hover:scale-[1.02] active:scale-[0.98]`}
                style={{ 
                  fontFamily: "Helvetica",
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6EF7FF]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className={`p-3 rounded-xl flex-shrink-0 transition-colors duration-300 ${
                  isActive 
                    ? 'bg-[#6EF7FF] text-[#22142A]' 
                    : 'bg-white/90 group-hover:bg-[#6EF7FF] text-[#22142A]'
                }`}>
                  <item.icon size={24} />
                </div>
                
                <div className="flex-1 relative z-10">
                  <h3 className={`font-bold text-lg transition-colors ${
                    isActive ? 'text-[#6EF7FF]' : 'text-white group-hover:text-white'
                  }`}>
                    {item.label}
                  </h3>
                  <p className={`text-sm transition-colors ${
                    isActive ? 'text-[#6EF7FF]/80' : 'text-white/60 group-hover:text-white/80'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {/* Indicador de acción */}
                <div className={`w-2 h-2 rounded-full transition-opacity duration-300 ${
                  isActive ? 'bg-[#6EF7FF] opacity-100' : 'bg-[#6EF7FF] opacity-0 group-hover:opacity-100'
                }`}></div>
              </Link>
            );
          })}
        </nav>

        {/* Footer con botón de cierre mejorado */}
        <div className="flex flex-col items-center gap-4 pb-8 pt-4">
          <div className="w-16 h-0.5 bg-white/20 rounded-full"></div>
          <button
            aria-label="Cerrar navegación"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center rounded-full shadow-lg w-14 h-14 group relative overflow-hidden
              bg-gradient-to-br from-[#6EF7FF] to-[#32dfff] hover:from-[#32dfff] hover:to-[#6EF7FF]
              hover:shadow-[0_0_40px_#6EF7FF60] transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              fontFamily: "Helvetica",
              border: "3px solid rgba(255,255,255,0.2)"
            }}
          >
            {/* Efecto de pulso */}
            <div className="absolute inset-0 rounded-full bg-[#6EF7FF] animate-ping opacity-20"></div>
            <X size={28} color="#22142A" className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <p className="text-white/50 text-xs">Toca para cerrar</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransferViewerSheet;
