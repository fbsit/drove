
import { useAuthLogin } from './auth/useAuthLogin';
import { useAuthRegister } from './auth/useAuthRegister';
import { useAuthProfile } from './auth/useAuthProfile';
import { useAuthRefresh } from './auth/useAuthRefresh';
import { useAuthVerification } from './auth/useAuthVerificationEmail';
import { User } from '@/services/authService';
import { AuthSignInData } from '@/types/auth';

export const useAuthActions = (
  setSession: (session: any) => void,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { refreshUser } = useAuthRefresh(setSession, setUser, setIsLoading);
  const { login, logout } = useAuthLogin(
    setSession,
    setUser,
    setIsLoading,
    refreshUser
  );
  const { register } = useAuthRegister(setIsLoading);
  const { updateProfile, completeProfile } = useAuthProfile(
    setIsLoading,
    refreshUser
  );
  const { sendVerificationCode, checkVerificationCode } = useAuthVerification(
    setIsLoading
  );

  return {
    login,
    logout,
    register,
    refreshUser,
    updateProfile,
    completeProfile,
    sendVerificationCode,
    checkVerificationCode,
  };
};
