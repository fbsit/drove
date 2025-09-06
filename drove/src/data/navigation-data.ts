
import {
  Gauge,
  Users,
  FileText,
  Calendar,
  BarChart2,
  LogOut,
  Euro,
  Briefcase,
  Car,
  Star,
  MessageSquare
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: any;
}

export interface RoleMenuConfig {
  admin: NavigationItem[];
  traffic_manager: NavigationItem[];
  client: NavigationItem[];
  drover: NavigationItem[];
}

export const navigationConfig: RoleMenuConfig = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
    { label: "Clientes", href: "/admin/clientes", icon: Users },
    { label: "Drovers", href: "/admin/drovers", icon: Car },
    { label: "Jefes de Tráfico", href: "/admin/jefes-trafico", icon: Briefcase },
    { label: "Traslados", href: "/admin/traslados", icon: Calendar },
    { label: "Reseñas", href: "/admin/resenas", icon: Star },
    { label: "Soporte", href: "/admin/soporte", icon: MessageSquare },
    { label: "Reportes", href: "/admin/reportes", icon: BarChart2 }
  ],
  traffic_manager: [
    { label: "Dashboard", href: "/trafico/dashboard", icon: Gauge },
    { label: "Traslados", href: "/trafico/traslados", icon: Calendar },
    { label: "Asignaciones", href: "/trafico/asignaciones", icon: FileText },
    { label: "Drovers", href: "/trafico/drivers", icon: Users },
  ],
  client: [
    { label: "Dashboard", href: "/cliente/dashboard", icon: Gauge },
    { label: "Mis Traslados", href: "/cliente/traslados", icon: Calendar },
    { label: "Solicitar Traslado", href: "/solicitar-traslado", icon: FileText },
  ],
  drover: [
    { label: "Dashboard", href: "/drover/dashboard", icon: Gauge },
    { label: "Reseñas", href: "/drover/resenas", icon: Star },
  ]
};

export const logoutIcon = LogOut;
