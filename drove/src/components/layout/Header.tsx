
import React, { useState, useRef } from "react";
import DroveLogo from "@/components/DroveLogo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Detectar si estamos en una página de perfil
  const isProfilePage = location.pathname.includes('/perfil');

  // Maneja click fuera para cerrar el menú rápido del avatar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Acción logout
  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  // Función DIRECTA para manejar clic en perfil - BYPASS ProfileRedirect
  const handlePerfilClick = () => {
    console.log("🖱️ DIRECTO - Clic en perfil - Usuario:", user?.user_type);
    setMenuOpen(false);
    
    // Redirigir DIRECTAMENTE según el tipo de usuario sin pasar por ProfileRedirect
    if (!user) {
      navigate("/login");
      return;
    }
    
    switch (user.role) {
      case "admin":
        console.log("🔐 DIRECTO - Redirigiendo admin a /admin/perfil");
        navigate("/admin/perfil");
        break;
      case "client":
        console.log("👤 DIRECTO - Redirigiendo cliente a /cliente/perfil");
        navigate("/cliente/perfil");
        break;
      case "drover":
        console.log("🚗 DIRECTO - Redirigiendo drover a /drover/perfil");
        navigate("/drover/perfil");
        break;
      case "traffic_manager":
        console.log("🚦 DIRECTO - Redirigiendo traffic_manager a /trafico/perfil");
        navigate("/trafico/perfil");
        break;
      default:
        console.log("⚠️ DIRECTO - Tipo no reconocido:", user.role, "- redirigiendo a /admin/perfil");
        navigate("/admin/perfil");
        break;
    }
  };

  // Función para volver al dashboard desde perfil
  const handleBackToDashboard = () => {
    if (!user) return;
    
    switch (user.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "traffic_manager":
        navigate("/trafico/dashboard");
        break;
      case "client":
        navigate("/cliente/dashboard");
        break;
      case "drover":
        navigate("/drover/dashboard");
        break;
      default:
        navigate("/dashboard");
        break;
    }
  };

  // Mostrar botón "Entrar" solo si NO está autenticado y estamos en Home
  const showEntrar = !isAuthenticated && location.pathname === "/";
  
  // Mostrar botón "Panel de Control" solo si está autenticado y estamos en Home
  const showPanelButton = isAuthenticated && location.pathname === "/";

  // Determinar la ruta del dashboard según el tipo de usuario
  const getDashboardRoute = () => {
    if (!user) return "/dashboard";
    
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "traffic_manager":
        return "/trafico/dashboard";
      case "client":
        return "/cliente/dashboard";
      case "drover":
        return "/drover/dashboard";
      default:
        return "/dashboard";
    }
  };

  // Derivar nombre visible del usuario (full_name | contactInfo.fullName | email)
  const getDisplayName = () => {
    const anyUser: any = user;
    return (
      anyUser?.full_name ||
      anyUser?.contactInfo?.fullName ||
      anyUser?.name ||
      anyUser?.email ||
      'Usuario'
    );
  };

  const getInitials = (nameInput?: string) => {
    const name = nameInput ?? getDisplayName();
    if (!name) return "";
    return name
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header
      className="bg-[#22142A] py-3 px-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-white/10 h-16"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {/* Logo o navegación de perfil */}
      <div className="flex items-center">
        {isProfilePage && isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <h1 className="text-white font-bold text-lg">Mi Perfil</h1>
          </div>
        ) : (
          <Link to="/" className="cursor-pointer">
            <DroveLogo size="lg" />
          </Link>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Botón "Panel de Control" si está autenticado y en Home */}
        {showPanelButton && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(getDashboardRoute())}
            className="flex items-center gap-2"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Panel de Control</span>
          </Button>
        )}
        
        {/* Botón Entrar solo en Home, si no autenticado */}
        {showEntrar && (
          <Link
            to="/login"
            className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl px-6 py-2 text-sm transition-colors"
            style={{ fontFamily: "Helvetica" }}
          >
            Entrar
          </Link>
        )}
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 relative">
            <span className="hidden md:block text-white font-bold">
              {getDisplayName()?.split(' ')[0]}
            </span>
            <div className="relative">
              <div
                className="cursor-pointer"
                onClick={() => setMenuOpen(v => !v)}
              >
                <Avatar>
                  <AvatarFallback className="bg-[#6EF7FF] text-[#22142A] font-bold">
                    {getInitials(user as any)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Menú contextual avatar */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-12 mt-2 min-w-[150px] bg-[#291A38] shadow-md border border-white/15 rounded-2xl py-2 text-sm animate-fade-in"
                  style={{
                    zIndex: 1200,
                    fontFamily: "Helvetica",
                  }}
                >
                  <button
                    className="block w-full text-left px-4 py-2 text-white hover:bg-[#6EF7FF22] rounded-2xl"
                    onClick={handlePerfilClick}
                  >
                    Mi Perfil
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-white hover:bg-[#6EF7FF22] rounded-2xl"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
