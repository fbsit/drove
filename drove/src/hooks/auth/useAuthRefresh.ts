
import { getCurrentUser } from '@/services/authService';
import { useToast } from '../use-toast';
import { useCallback } from 'react';

export const useAuthRefresh = (
  setSession: (s: any) => void,
  setUser: (u: any) => void,
  setIsLoading: (l: boolean) => void
) => {
  const { toast } = useToast();

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    console.log("token obtenido", token);
    if (!token) {
      setSession(null); setUser(null);
      return;
    }

    try {
      console.log("init");
      setIsLoading(true);

      // 🚀 llamar al nuevo getCurrentUser (cache‑first)
      const user = await getCurrentUser();

      if (user) {
        setUser(user);
        setSession({ access_token: token, expiresAt: Number(localStorage.getItem('auth_expires_at')) });
      } else {
        // Token expirado (getCurrentUser hizo clearAuthToken)
        setSession(null); setUser(null);
      }
    } catch (err: any) {
      if ([401, 403].includes(err.response?.status)) {
        setSession(null); setUser(null);
      } else {
        toast({ title: 'Red inestable', description: 'Reintentaremos en unos segundos.' });
      }
    } finally {
      console.log("finalizando");
      setIsLoading(false);
    }
  }, [setSession, setUser, setIsLoading, toast]);

  return { refreshUser };
};
