
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { AuthService, User } from '@/services/authService';
import { toast } from '@/hooks/use-toast';
import type { AuthSignInData } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  user: User | null;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;                 // alias legacy
  needsProfileCompletion: boolean;
  login: (d: AuthSignInData) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;     // alias legacy
  setUser: (u: User | null) => void;
  setSession: (s: any) => void;
  refreshUser: () => Promise<void>;
  updateProfile: (d: any) => Promise<void>;
  sendVerificationCode: (e: string) => Promise<void>;
  checkVerificationCode: (e: string, c: string) => Promise<boolean>;
  getRedirectPathForUser: () => string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  /* ---------- estado centralizado ---------- */
  const authState = useAuthState();          // { user, session, loading, … setters }
  const authActions = useAuthActions(
    authState.setSession,
    authState.setUser,
    authState.setIsLoading
  );

  /* ---------- helpers ---------- */
  const refreshUser = useCallback(async () => {
    authState.setIsLoading(true);
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        authState.setUser(userData as any);
        // Persistir último acceso si viene del backend o si no existe
        try {
          const backendLast = (userData as any)?.last_login_at || (userData as any)?.lastLoginAt || null;
          const stored = localStorage.getItem('last_login_at');
          if (backendLast) {
            localStorage.setItem('last_login_at', String(backendLast));
          } else if (!stored) {
            // Primer hidrato sin dato de backend: usar hora actual como aproximación
            localStorage.setItem('last_login_at', new Date().toISOString());
          }
        } catch { }
      } else {
        authState.setUser(null);
      }
    } catch (err) {
      console.error('[AUTH] refreshUser', err);
      authState.setUser(null);
    } finally {
      authState.setIsLoading(false);
    }
  }, []);

  const login = async (data: AuthSignInData) => {
    authState.setIsLoading(true);
    try {
      console.log("Iniciando login real con:", data.email);

      const res = await AuthService.signIn(data);
      console.log("Respuesta del login:", res);

      authState.setSession({ access_token: res.access_token, expiresIn: res.expiresIn });

      localStorage.setItem('auth_user_email', data.email);
      console.log("Usuario obtenido del login:", res.user);

      // IMPORTANTE: Esperar a obtener los datos completos del usuario
      try {
        console.log("Obteniendo datos completos del usuario...");
        const userData = await AuthService.getCurrentUser();
        console.log("Datos completos del usuario:", userData);

        if (userData) {
          authState.setUser(userData as any);
          localStorage.setItem('auth_user_role', (userData as any).role || '');
          localStorage.setItem('auth_user_id', (userData as any).id);
          localStorage.setItem('auth_user_email', (userData as any).email);
          localStorage.setItem('auth_user_name', (userData as any).full_name || '');
          localStorage.setItem('auth_user_type', (userData as any).user_type || '');

          console.log("✅ Usuario completo establecido:", userData);
          getRedirectPathForUser();
        } else {
          throw new Error("No se pudieron obtener los datos del usuario");
        }
      } catch (e) {
        console.error('❌ Error al obtener datos completos del usuario:', e);
        throw e; // Re-lanzar el error para que sea manejado por el componente Login
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
      authState.setIsLoading(false);
    }
  };

  const signOut = async () => {
    authState.setIsLoading(true);
    try {
      await AuthService.signOut();
      // Limpieza completa de storage
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user_email');
        localStorage.removeItem('auth_user_role');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('auth_user_name');
        localStorage.removeItem('auth_user_type');
      } catch { }
      authState.setUser(null);
      authState.setSession(null);
      toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión.' });
      navigate('/');
    } catch (err) {
      console.error('[AUTH] signOut', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la sesión',
      });
    } finally {
      authState.setIsLoading(false);
    }
  };

  /* ---------- carga inicial ---------- */
  useEffect(() => {
    if (localStorage.getItem('auth_token')) {
      refreshUser();               // hidrata la sesión
    } else {
      authState.setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirección global ante 401
  useEffect(() => {
    const onUnauthorized = () => {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user_email');
        localStorage.removeItem('auth_user_role');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('auth_user_name');
        localStorage.removeItem('auth_user_type');
      } catch { }
      authState.setUser(null);
      authState.setSession(null);
      navigate('/');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [navigate]);

  /* ---------- otros métodos (sin cambios) ---------- */
  const updateProfile = async (data: any) => {
    try {
      await AuthService.updateProfile(data);
      await refreshUser();
      toast({ title: 'Perfil actualizado', description: 'Datos guardados.' });
    } catch (err) {
      console.error('[AUTH] updateProfile', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
      });
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      await AuthService.sendVerificationCode(email);
      toast({
        title: 'Código enviado',
        description: 'Revisa tu correo para el código de verificación',
      });
    } catch (err) {
      console.error('[AUTH] sendCode', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar el código',
      });
    }
  };

  const checkVerificationCode = async (
    email: string,
    code: string
  ): Promise<boolean> => {
    try {
      const ok = await AuthService.verifyCode(email, code);
      if (ok)
        toast({ title: 'Código verificado', description: 'Continúa el proceso' });
      return ok;
    } catch (err) {
      console.error('[AUTH] verifyCode', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Código incorrecto',
      });
      return false;
    }
  };

  const getRedirectPathForUser = (): string => {
    console.log("🎯 getRedirectPathForUser - Usuario actual:", authState.user);
    console.log("🎯 getRedirectPathForUser - Role:", authState.user?.role);

    const rawRole = authState.user?.role || '';
    const role = rawRole.toLowerCase();
    switch (role) {
      case 'admin':
        console.log("🔐 Redirigiendo admin a /admin/dashboard");
        return '/admin/dashboard';
      case 'traffic_manager':
      case 'trafficboss':
      case 'traffic_boss':
        console.log("🚦 Redirigiendo traffic_manager a /trafico/dashboard");
        return '/trafico/dashboard';
      case 'drover':
        console.log("🚗 Redirigiendo drover a /drover/dashboard");
        return '/drover/dashboard';
      case 'client':
      default:
        console.log("👤 Redirigiendo cliente a /cliente/dashboard");
        return '/cliente/dashboard';
    }
  };

  /* ---------- valor expuesto ---------- */
  const value: AuthContextProps = {
    user: authState.user,
    session: authState.session,
    isAuthenticated: !!authState.user, // derivado del estado real
    isLoading: authState.loading,
    loading: authState.loading,        // compatibilidad con código existente
    needsProfileCompletion: authState.needsProfileCompletion,
    login,
    logout: signOut,
    signOut,
    setUser: authState.setUser,
    setSession: authState.setSession,
    refreshUser,
    updateProfile,
    sendVerificationCode,
    checkVerificationCode,
    getRedirectPathForUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
