
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
      className="flex bg-drove !p-0"
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
            maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          }}
        >
          <div className="h-full">
            {/* Aquí el AppSidebar */}
            {/* <AppSidebar /> --> Renderiza desde App.tsx o layout general */}
          </div>
        </div>
      </div>

      {/* MAIN: contenido principal - sin padding en móvil, centrado automático */}
      <main className='w-full'>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
