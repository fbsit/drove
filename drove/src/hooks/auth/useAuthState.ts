
import { useEffect, useState } from 'react';
import { AuthService, User } from '@/services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  session: any;
  needsProfileCompletion: boolean;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    session: null,
    needsProfileCompletion: false
  });

  const setSession = (session: any) => {
    setAuthState(prev => ({ ...prev, session }));
  };

  const setUser = (user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      needsProfileCompletion: user ? !user.profile_complete : false
    }));
  };

  const setIsLoading = (loading: boolean) => {
    setAuthState(prev => ({ ...prev, loading }));
  };

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            session: null,
            needsProfileCompletion: false
          });
          return;
        }

        const userData = await AuthService.getCurrentUser();
        if (userData?.user) {
          setAuthState({
            isAuthenticated: true,
            user: userData.user,
            loading: false,
            session: { access_token: token },
            needsProfileCompletion: !userData.user.profile_complete
          });
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        localStorage.removeItem('auth_token');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          session: null,
          needsProfileCompletion: false
        });
      }
    };

    checkAuthState();
  }, []);

  return {
    ...authState,
    setSession,
    setUser,
    setIsLoading
  };
};
