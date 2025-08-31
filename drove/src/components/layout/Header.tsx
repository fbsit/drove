
import React, { useState, useRef } from "react";
import DroveLogo from "@/components/DroveLogo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowLeft, Bell, Check } from "lucide-react";
import { useEffect } from "react";
import NotificationService from "@/services/notificationService";
import { useSocket } from '@/contexts/SocketContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { onNotification } = useSocket();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

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

  // Cerrar popover de notificaciones al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Acción logout
  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  // Carga contador tras autenticación y cambios de usuario
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await NotificationService.getUnreadCount();
        // Nunca reducir el contador con respuestas atrasadas
        setUnreadCount((prev) => Math.max(prev, count || 0));
      } catch { }
    };
    if (isAuthenticated && user?.id) {
      fetchCount();
    }
  }, [isAuthenticated, user?.id, user?.role]);

  // Cargar listado inicial tras login/cambio de usuario (o recarga con sesión válida)
  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await NotificationService.getNotifications();
        const arr = Array.isArray(list) ? list.slice(0, 10) : [];
        setNotifications(arr);
        // No bajamos el contador basados en listado parcial; solo lo subimos si procede
        const unread = arr.filter((n: any) => !n.read).length;
        if (unread > unreadCount) setUnreadCount(unread);
      } catch { }
    };
    if (isAuthenticated && user?.id) {
      fetchList();
    }
  }, [isAuthenticated, user?.id, user?.role]);

  // Tiempo real por socket: incrementar badge y refrescar lista si panel abierto
  useEffect(() => {
    if (!onNotification) return;
    const unsubscribe = onNotification((n: any) => {
      // Evita double-count cuando el servidor ya manda una lista con el nuevo elemento
      const exists = notifications.some((x) => x.id === n.id);
      if (!exists) {
        setUnreadCount((c) => c + 1);
        if (notifOpen) {
          setNotifications((prev) => [n, ...prev].slice(0, 10));
        }
      }
    });
    return () => { try { (unsubscribe as any)?.(); } catch { } };
  }, [onNotification, notifOpen, notifications]);

  // Refetch when window gains focus for snappier UX (sin polling)
  useEffect(() => {
    const onFocus = async () => {
      if (!isAuthenticated) return;
      try {
        const count = await NotificationService.getUnreadCount();
        // Si el servidor dice menos que nuestro contador local, mantenemos el mayor para evitar parpadeos
        setUnreadCount((prev) => Math.max(prev, count || 0));
      } catch { }
      // Si recargó y el listado está vacío, obtenerlo de forma perezosa
      if (notifications.length === 0) {
        try {
          const list = await NotificationService.getNotifications();
          const arr = Array.isArray(list) ? list.slice(0, 10) : [];
          setNotifications(arr);
        } catch { }
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, notifications.length]);

  const toggleNotifications = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen) {
      try {
        const list = await NotificationService.getNotifications();
        const arr = Array.isArray(list) ? list.slice(0, 10) : [];
        setNotifications(arr);
        // Fallback: no reducimos el contador; solo incrementamos si detectamos más
        const unread = arr.filter((n: any) => !n.read).length;
        if (unread > unreadCount) setUnreadCount(unread);
      } catch { }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      // reduce badge
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { }
  };

  // Deducción de ruta de destino desde la notificación
  const resolveNotificationRoute = (n: any): string | null => {
    const role = String(user?.role || '').toLowerCase();
    const entityType = String(n?.entityType || n?.data?.entityType || '').toUpperCase();
    const entityId = n?.entityId || n?.data?.entityId || n?.data?.travelId || n?.data?.id;
    const category = String(n?.category || '').toUpperCase();

    // Viajes / traslados
    if (entityType === 'TRAVEL' && entityId) {
      if (role === 'admin' || role === 'traffic_manager') {
        // Para admin: sólo TRAVEL_CREATED va a asignación; el resto al detalle de viaje
        if (category === 'TRAVEL_CREATED') return `/admin/asignar/${entityId}`;
        return `/ver-traslado/${entityId}`;
      }
      if (role === 'client') return `/cliente/traslados/${entityId}`;
      if (role === 'drover') return `/traslados/activo/${entityId}`;
      return `/viajes/${entityId}`; // fallback común
    }

    // Nuevos usuarios
    if (category === 'NEW_USER' || entityType === 'USER') {
      const userRole = String(n?.data?.userRole || '').toLowerCase();
      if (userRole === 'drover') return n?.entityId ? `/admin/drovers/${n.entityId}` : '/admin/drovers';
      if (userRole === 'client') return n?.entityId ? `/admin/clientes/${n.entityId}` : '/admin/clientes';
      // fallback a listado de clientes si no se conoce el rol
      return '/admin/clientes';
    }

    // Por defecto, ir al dashboard del rol
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'client') return '/cliente/dashboard';
    if (role === 'drover') return '/drover/dashboard';
    if (role === 'traffic_manager') return '/trafico/dashboard';
    return '/';
  };

  const handleNotificationClick = async (n: any) => {
    const to = resolveNotificationRoute(n);
    if (!to) return;
    try {
      if (!n.read) await handleMarkAsRead(n.id);
    } finally {
      setNotifOpen(false);
      navigate(to);
    }
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
            {/* Bell badge */}
            <div className="relative mr-1 cursor-pointer" onClick={toggleNotifications}>
              <Bell className="text-white " size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <div
                ref={notifRef}
                className={`
                    absolute right-0 top-full mt-2 w-72 bg-[#291A38]
                    border border-white/15 border-t-transparent rounded-b-2xl shadow-lg z-[1200]
                    transform transition-all duration-300 ease-out
                    origin-top
                    ${notifOpen ? "opacity-100 translate-y-3" : "opacity-0  translate-y-[-115%]"}
                  `}
              >
                <div className="p-3 border-b border-white/10 text-white font-bold">
                  Notificaciones
                </div>
                <div className="h-80 max-h-[70dvh] overflow-auto scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-white/70 text-sm">Sin notificaciones</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 flex items-start gap-2 hover:bg-white/5 cursor-pointer"
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-white/30" : "bg-[#6EF7FF]"
                            }`}
                        />
                        <div className="flex-1">
                          <div className="text-white text-sm font-semibold">{n.title}</div>
                          <div className="text-white/70 text-xs">{n.message}</div>
                        </div>
                        {!n.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(n.id);
                            }}
                            className="text-xs text-[#6EF7FF] hover:underline flex items-center gap-1"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
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
                    {getInitials()}
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
