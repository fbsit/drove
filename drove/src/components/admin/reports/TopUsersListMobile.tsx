
import React from 'react';
import { Trophy, Award, Medal, ExternalLink, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TopUsersListMobileProps {
  title: string;
  icon: React.ReactNode;
  users: Array<{
    id?: string;
    name: string;
    count: number;
    rating?: number;
    estado?: string;
  }>;
  userType?: 'client' | 'drover';
  linkable?: boolean;
}

const TopUsersListMobile: React.FC<TopUsersListMobileProps> = ({ 
  title, 
  icon, 
  users, 
  userType = 'client',
  linkable = true 
}) => {
  const navigate = useNavigate();

  const handleUserClick = (user: any) => {
    if (!linkable || !user.id) return;
    
    if (userType === 'drover') {
      navigate(`/admin/drovers/${user.id}`);
    } else if (userType === 'client') {
      navigate(`/admin/clients/${user.id}`);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 1:
        return <Award className="h-4 w-4 text-gray-300" />;
      case 2:
        return <Medal className="h-4 w-4 text-orange-400" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
        );
    }
  };

  const getRankBackground = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30";
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border border-gray-400/30";
      case 2:
        return "bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30";
      default:
        return "bg-white/5 border border-white/10";
    }
  };

  const getStatusColor = (estado?: string) => {
    switch (estado) {
      case 'aprobado':
        return 'text-emerald-400';
      case 'pendiente':
        return 'text-amber-400';
      case 'rechazado':
        return 'text-rose-400';
      default:
        return 'text-white/60';
    }
  };

  // Solo mostrar top 3 en móvil para evitar scroll excesivo
  const topUsers = users.slice(0, 3);

  return (
    <Card className="bg-white/10 border-0 text-white p-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2">
          {topUsers && topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div 
                key={index}
                className={`rounded-xl p-3 transition-all duration-200 ${getRankBackground(index)} ${
                  linkable && user.id ? 'hover:bg-white/15 cursor-pointer active:scale-95' : ''
                }`}
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-white font-semibold truncate text-sm">
                          {user.name}
                        </p>
                        {linkable && user.id && (
                          <ExternalLink className="h-3 w-3 text-[#6EF7FF] opacity-70 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-white/60">#{index + 1}</span>
                        {user.rating && (
                          <>
                            <span className="text-white/40">•</span>
                            <span className="text-yellow-400">★{user.rating}</span>
                          </>
                        )}
                        {user.estado && (
                          <>
                            <span className="text-white/40">•</span>
                            <span className={getStatusColor(user.estado)}>
                              {user.estado === 'aprobado' ? 'Activo' : 
                               user.estado === 'pendiente' ? 'Pendiente' : 
                               user.estado === 'rechazado' ? 'Inactivo' : user.estado}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#6EF7FF]/20 text-[#6EF7FF] rounded-lg px-2 py-1 text-center">
                      <p className="text-sm font-bold">{user.count}</p>
                      <p className="text-xs leading-none">traslados</p>
                    </div>
                    {linkable && user.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-[#6EF7FF]/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                      >
                        <Eye className="h-3 w-3 text-[#6EF7FF]" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 text-center py-4 text-sm">No hay datos disponibles</p>
          )}
        </div>
        {users.length > 3 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-white/50">
              Mostrando top 3 de {users.length} usuarios
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopUsersListMobile;
