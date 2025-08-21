import React, { useEffect, useCallback } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/* … const ROLE_ALIASES , ADMIN_ALLOWED_ROUTES, normalizeRole etc … */

const ProtectedRoute: React.FC<any> = ({
  children,
  requiredRole,
}) => {
  const { isLoading, isAuthenticated, user, refreshUser } = useAuth();
  const location = useLocation();

  console.log("user",user)

  /* ─── helpers ─── */
  const showToast = useCallback(
    (title: string, description: string) =>
      setTimeout(() => toast({ variant: 'destructive', title, description }), 0),
    []
  );

  /* ─── intenta hidratar al usuario si hay token ─── */
  useEffect(() => {
    if (localStorage.getItem('auth_token') && !isAuthenticated && !isLoading) {
      // importante: espera a que termine la promesa; AuthContext actualizará isLoading
      refreshUser().catch(console.error);
    }
  }, [isAuthenticated, isLoading]);

  /* ─── 1) Mientras siga cargando, muestra un loader ─── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  /* ─── 2) Sólo ahora, con isLoading=false, decidimos ─── */
  if (!isAuthenticated || !user) {
    if (!location.pathname.startsWith('/login')) {
      showToast('Sesión no válida', 'Por favor inicia sesión para continuar');
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* … resto de la lógica de roles idéntica … */

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
