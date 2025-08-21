
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNavigationMenus } from "@/hooks/useNavigationMenus";
import { logoutIcon as LogoutIcon } from "@/data/navigation-data";
import SidebarTrigger from "./SidebarTrigger";

export default function AppSidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { navItems } = useNavigationMenus();

  console.log("navItems",navItems)

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) return null;
  
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      side="left" 
      variant="sidebar" 
      collapsible="icon"
      className="border-r border-white/10"
    >
      {/* Espaciador para el header fijo */}
      <div className="h-16 shrink-0" />
      
      {/* Contenido del sidebar */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Botón trigger redondo */}
        <SidebarTrigger />
        
        <SidebarContent className="flex-1 flex flex-col px-0 pb-6 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                      className={`
                        rounded-2xl px-3 py-2 my-1
                        flex items-center gap-3
                        group relative
                        ${location.pathname === item.href ? "bg-[#6EF7FF]/20 text-[#6EF7FF]" : "text-white hover:bg-white/5"}
                        justify-start
                        w-full
                        text-left
                      `}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <Link to={item.href} className="flex items-center gap-3 w-full text-left">
                        <item.icon size={18} className="shrink-0" />
                        {!isCollapsed && (
                          <span
                            className="ml-1 font-medium truncate text-base"
                            style={{ fontFamily: "Helvetica" }}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="px-2 pb-4 pt-2 border-t border-white/10 mt-auto">
          <button
            className="flex items-center w-full px-2 py-3 rounded-2xl gap-2 text-white hover:bg-white/10 transition-colors font-medium mt-1 justify-start"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogoutIcon size={16} className="opacity-80" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
