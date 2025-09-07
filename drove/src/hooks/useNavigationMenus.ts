
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { navigationConfig, NavigationItem } from '@/data/navigation-data';

export const useNavigationMenus = () => {
  const { user, needsProfileCompletion } = useAuth();

  const navItems = useMemo(() => {
    console.log("user role ->",user.role)
    if (!user?.role) return [];

    const baseItems = navigationConfig[user.role.toLocaleLowerCase() as keyof typeof navigationConfig] || [];

    // Eliminamos la opción de "Completar Perfil" para clientes
    return baseItems;
  }, [user?.role, needsProfileCompletion]);

  return { navItems };
};
