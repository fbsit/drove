
import { useToast } from '../use-toast';
import {
  signIn,
  signOut,
  User,
  getCurrentUser,
} from '@/services/authService';
import type { AuthSignInData } from '@/types/auth';

export const useAuthLogin = (
  setSession: (session: any) => void,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  refreshUser: () => Promise<void>
) => {
  const { toast } = useToast();

  const login = async (data: AuthSignInData) => {
    try {
      setIsLoading(true);
      console.log("Iniciando login real con:", data.email);

      const res = await signIn(data);
      console.log("Respuesta del login:", res);

      setSession({ access_token: res.access_token, expiresIn: res.expiresIn });
      
      localStorage.setItem('auth_user_email', data.email);
      console.log("Usuario obtenido del login:", res.user);
  
      try {
        const userData = await getCurrentUser();
        console.log("Datos completos del usuario:", userData);
        
        if (userData) {
          const userType = mapRoleToUserType(userData.role);
          
          const merged: User = {
            ...userData,
            user_type: userType,
            role: userData.role,
          };
          
          setUser(merged);
          localStorage.setItem('auth_user_role', merged.role || '');
          localStorage.setItem('auth_user_id', merged.id);
          localStorage.setItem('auth_user_email', merged.email);
          localStorage.setItem('auth_user_name', merged.full_name || '');
          localStorage.setItem('auth_user_type', merged.user_type || '');
        }
      } catch (e) {
        console.error('No se pudieron refrescar datos completos:', e);
      }
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Has iniciado sesión correctamente',
      });
    } catch (err: any) {
      console.error('Error en login:', err);

      let errorMessage = 'Credenciales incorrectas';
      
      if (err?.status === 401) {
        if (err.message === 'Email no verificado') {
          throw err;
        } else {
          errorMessage = 'Email o contraseña incorrectos';
        }
      } else if (err?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (err?.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: errorMessage,
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setSession(null);
      setUser(null);
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
    } catch (err) {
      console.error('Error en logout:', err);
      setSession(null);
      setUser(null);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al cerrar sesión 1',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mapRoleToUserType = (
    role?: string
  ): 'client' | 'drover' | 'admin' | 'traffic_manager' => {
    if (!role) return 'client';
    const r = role.toUpperCase();
    if (r === 'DROVER' || r === 'DRIVER') return 'drover';
    if (r === 'ADMIN') return 'admin';
    if (r === 'TRAFFIC_MANAGER') return 'traffic_manager';
    return 'client';
  };

  return { login, logout };
};
