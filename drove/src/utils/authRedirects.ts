
import { User } from '@/services/authService';

const ROLE_TO_PATH: Record<string, string> = {
  // Admin
  ADMIN: '/admin/dashboard',
  TRAFFIC_MANAGER: '/admin/dashboard',
  // Drover / Driver
  DROVER: '/drover/dashboard',
  DRIVER: '/drover/dashboard',
  DROVE: '/drover/dashboard',
  // Cliente
  CLIENT: '/cliente/dashboard',
  CLIENTE: '/cliente/dashboard',
};

export const getRedirectPathForUser = (user: User | null): string => {
  if (!user) return '/login';
  
  // Normaliza: toma primero `role`, si no existe usa `user_type`
  const role = user.role || user.user_type || '';
  const rawRole = role.trim().toUpperCase();

  // Quita espacios, guiones y cualquier otro carácter no alfanumérico
  const normalizedRole = rawRole.replace(/[^A-Z0-9]/g, '');
  
  // Busca en el mapa
  const path = ROLE_TO_PATH[normalizedRole];

  // Devuelve la ruta encontrada o fallback según el user_type
  if (path) return path;
  
  // Fallback basado en user_type
  switch (user.role.toLocaleLowerCase()) {
    case 'admin':
    case 'traffic_manager':
      return '/admin/dashboard';
    case 'drover':
      return '/drover/dashboard';
    case 'client':
      return '/cliente/dashboard';
    default:
      return '/login';
  }
};
