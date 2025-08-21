
import { useState } from 'react';
import { AuthService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface ClientRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName?: string;
  clientType: 'individual' | 'empresa';
}

export const useClientRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerClient = async (data: ClientRegistrationData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[CLIENT_REGISTRATION] 🔄 Registrando cliente:', data);
      
      const response = await AuthService.signUp({
        email: data.email,
        password: data.password,
        userType: 'client',
        contactInfo: {
          fullName: data.fullName,
          phone: data.phone,
          profileComplete: true
        }
      });

      console.log('[CLIENT_REGISTRATION] ✅ Cliente registrado:', response);
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Revisa tu email para verificar tu cuenta."
      });

      return { success: true, data: response };
    } catch (error: any) {
      console.error('[CLIENT_REGISTRATION] ❌ Error en registro:', error);
      const errorMessage = error?.message || 'Error en el registro';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: errorMessage
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerClient,
    isLoading,
    error
  };
};
