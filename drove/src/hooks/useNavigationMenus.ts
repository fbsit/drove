
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { navigationConfig, NavigationItem } from '@/data/navigation-data';

export const useNavigationMenus = () => {
  const { user, needsProfileCompletion } = useAuth();

  const navItems = useMemo(() => {
    console.log("user role ->",user.role)
    if (!user?.role) return [];

    const baseItems = navigationConfig[user.role.toLocaleLowerCase() as keyof typeof navigationConfig] || [];
    
    // Para clientes, agregar "Completar Perfil" si es necesario
    if (user.role.toLocaleLowerCase() === 'client' && needsProfileCompletion) {
      return [
        ...baseItems,
        { 
          label: "Completar Perfil", 
          href: "/cliente/perfil", 
          icon: navigationConfig.admin[1].icon // Users icon
        }
      ];
    }

    return baseItems;
  }, [user?.role, needsProfileCompletion]);

  return { navItems };
};
