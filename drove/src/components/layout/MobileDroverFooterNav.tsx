
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Star, MessageSquare, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupportChat } from '@/contexts/SupportChatContext';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileDroverFooterNav = () => {
  const location = useLocation();
  const { openChat } = useSupportChat();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/drover/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Escanear QR',
      action: () => navigate('/qr/scan'),
      icon: QrCode,
    },
    {
      name: 'Reseñas',
      path: '/drover/resenas',
      icon: Star,
    },
    {
      name: 'Soporte',
      action: openChat,
      icon: MessageSquare,
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

          if (item.action) {
            // Botón de acción (soporte)
            return (
              <button
                key={item.name}
                onClick={item.action}
                className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 hover:bg-white/10 active:scale-95"
              >
                <IconComponent 
                  size={24} 
                  className="text-[#6EF7FF] mb-1" 
                />
                <span 
                  className="text-xs font-semibold text-[#6EF7FF]"
                  style={{ fontFamily: "Helvetica" }}
                >
                  {item.name}
                </span>
              </button>
            );
          }

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
