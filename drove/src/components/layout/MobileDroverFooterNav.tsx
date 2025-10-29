
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileDroverFooterNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/drover/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Reseñas',
      path: '/drover/resenas',
      icon: Star,
    },
  ];

  const isActivePath = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1B1230]/95 backdrop-blur-sm border-t border-white/10 z-40 md:hidden">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const isActive = isActivePath(item.path);
          const IconComponent = item.icon;

          // no action items in drover footer for now

          // Enlaces de navegación
          return (
            <Link
              key={item.name}
              to={item.path!}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 hover:bg-white/10 active:scale-95 ${
                isActive ? 'bg-[#6EF7FF]/20' : ''
              }`}
            >
              <IconComponent 
                size={24} 
                className={`mb-1 transition-colors ${
                  isActive ? 'text-[#6EF7FF]' : 'text-white/70'
                }`} 
              />
              <span 
                className={`text-xs font-semibold transition-colors ${
                  isActive ? 'text-[#6EF7FF]' : 'text-white/70'
                }`}
                style={{ fontFamily: "Helvetica" }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileDroverFooterNav;
