
import { useToast } from '../use-toast';
import { AuthService } from '@/services/authService';

export const useAuthVerification = (
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

  const sendVerificationCode = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.requestEmailValidation(email);
      
      toast({
        title: "Código enviado",
        description: "Hemos enviado un código de verificación a tu correo.",
      });
    } catch (error: any) {
      console.error('Error al enviar código:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo enviar el código de verificación.",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkVerificationCode = async (email: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await AuthService.verifyEmailCode(email, code);
      
      toast({
        title: "Verificación exitosa",
        description: "Tu correo ha sido verificado correctamente.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error al verificar código:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Código de verificación inválido.",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendVerificationCode,
    checkVerificationCode,
  };
};
