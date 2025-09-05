import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from './Header';
import AppSidebar from './AppSidebar';
import MobileAdminFab from "./MobileAdminFab";
import MobileAdminSheet from "./MobileAdminSheet";
import DroverSupportChatFab from './DroverSupportChatFab';
import SupportChatModal from "../support/SupportChatModal";
import { useAuth } from '@/contexts/AuthContext';

// Componente para el FAB de soporte global
function GlobalSupportChatFab() {
  return <DroverSupportChatFab />;
}

// Componente para navegación móvil admin
function AdminMobileNavGlobal() {
  const [openNavSheet, setOpenNavSheet] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // 👉 ahora usamos role directamente
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const isHome = location.pathname === "/";

  if (!isAdmin || isHome) return null;

  return (
    <>
      <MobileAdminFab onClick={() => setOpenNavSheet(true)} />
      <MobileAdminSheet open={openNavSheet} onOpenChange={setOpenNavSheet} />
    </>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Layout simple para usuarios no autenticados o en home
  if (!isAuthenticated || (isAuthenticated && isHomePage)) {
    return (
      <div className="min-h-screen w-full bg-[#22142A]">
        <Header />
        {children}
        <GlobalSupportChatFab />
        <SupportChatModal />
      </div>
    );
  }

  // Layout con sidebar para usuarios autenticados
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#22142A]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 py-24 px-4 md:px-8 md:pt-[100px] lg:px-20 overflow-hidden">
            <div className="h-full max-w-full">
              {children}
            </div>
            <GlobalSupportChatFab />
          </main>
        </div>
        <AdminMobileNavGlobal />
        <SupportChatModal />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
