
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const HEADER_HEIGHT = 64;
const MOBILE_HEADER_HEIGHT = 56;

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

/**
 * Layout dashboard: header fijo arriba, sidebar sticky y contenido.
 * Sidebar SIEMPRE visible bajo header, nunca lo tapa ni lo sobrepone.
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className="flex min-h-screen bg-drove"
      style={{
        fontFamily: "Helvetica, Arial, sans-serif",
        paddingTop: isMobile ? MOBILE_HEADER_HEIGHT : HEADER_HEIGHT,
      }}
    >
      {/* Sidebar sticky justo bajo el header */}
      <div className="hidden md:block">
        <div
          className="sticky z-30"
          style={{
            top: HEADER_HEIGHT,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          }}
        >
          <div className="h-full">
            {/* Aquí el AppSidebar */}
            {/* <AppSidebar /> --> Renderiza desde App.tsx o layout general */}
          </div>
        </div>
      </div>
      
      {/* MAIN: contenido principal - sin padding en móvil, centrado automático */}
      <main className={`flex-1 min-h-screen w-full mx-auto ${
        isMobile ? 'px-3' : 'md:px-4 px-0'
      }`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
