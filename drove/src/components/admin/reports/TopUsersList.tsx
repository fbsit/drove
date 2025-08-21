
import React from 'react';
import { User as UserIcon, Trophy, Award, Medal, ExternalLink, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopUsersListProps {
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

const TopUsersList: React.FC<TopUsersListProps> = ({ 
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
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Award className="h-6 w-6 text-gray-300" />;
      case 2:
        return <Medal className="h-6 w-6 text-orange-400" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
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

  return (
    <Card className="bg-white/10 border-0 text-white p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`rounded-xl p-4 transition-all duration-200 ${getRankBackground(index)} ${
                        linkable && user.id ? 'hover:bg-white/15 cursor-pointer' : ''
                      }`}
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getRankIcon(index)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold truncate text-sm md:text-base">
                                {user.name}
                              </p>
                              {linkable && user.id && (
                                <ExternalLink className="h-3 w-3 text-[#6EF7FF] opacity-70" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-white/60">Posición #{index + 1}</span>
                              {user.rating && (
                                <>
                                  <span className="text-white/40">•</span>
                                  <span className="text-yellow-400">★ {user.rating}</span>
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
                          <div className="bg-[#6EF7FF]/20 text-[#6EF7FF] rounded-lg px-3 py-2 text-center">
                            <p className="text-lg font-bold">{user.count}</p>
                            <p className="text-xs">traslados</p>
                          </div>
                          {linkable && user.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-[#6EF7FF]/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(user);
                              }}
                            >
                              <Eye className="h-4 w-4 text-[#6EF7FF]" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {linkable && user.id 
                        ? `Hacer clic para ver perfil de ${user.name}` 
                        : `${user.name} - ${user.count} traslados`}
                      {user.rating && ` • Valoración: ${user.rating}⭐`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            <p className="text-white/70 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopUsersList;
