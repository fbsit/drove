
import { useToast } from '../use-toast';
import { AuthService } from '@/services/authService';
import type { AuthSignUpRequest, AuthSignUpResponse } from '@/services/api/types/auth';

export const useAuthRegister = (
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

  const register = async (data: AuthSignUpRequest): Promise<AuthSignUpResponse> => {
    try {
      setIsLoading(true);
      console.log('Iniciando registro con:', data);
      
      // Usar el servicio de autenticación
      const response = await AuthService.signUp(data);
      
      console.log('Respuesta del registro:', response);
      
      toast({
        title: "Registro exitoso",
        description: "Te has registrado correctamente. Revisa tu correo para verificar tu cuenta.",
      });
      
      return response;
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Error al registrarse. Inténtalo de nuevo.",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register
  };
};
