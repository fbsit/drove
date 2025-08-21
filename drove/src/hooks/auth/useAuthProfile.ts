
import { useToast } from '../use-toast';
import { updateUserProfile, markProfileAsComplete, User } from '@/services/authService';

export const useAuthProfile = (
  setIsLoading: (loading: boolean) => void,
  refreshUser: () => Promise<void>
) => {
  const { toast } = useToast();

  const updateProfile = async (data: Partial<User>) => {
    try {
      console.log("actualizando perfil")
      setIsLoading(true);
      
      // Obtener el ID del usuario directamente del localStorage
      const userId = localStorage.getItem('auth_user_id');
      
      if (!userId) {
        throw new Error("No se pudo encontrar el ID del usuario");
      }
      
      console.log('Actualizando perfil para usuario:', userId, 'con datos:', data);
      
      await updateUserProfile(userId, data);
      await refreshUser();
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar tu información. Intenta nuevamente.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async () => {
    try {
      console.log("complete perfil")
      setIsLoading(true);
      
      // Obtener el ID del usuario directamente del localStorage
      const userId = localStorage.getItem('auth_user_id');
      
      if (!userId) {
        throw new Error("No se pudo encontrar el ID del usuario");
      }
      
      console.log('Marcando perfil como completo para usuario con ID:', userId);
      
      await markProfileAsComplete(userId);
      await refreshUser();
      
      toast({
        title: "Perfil completado",
        description: "Tu perfil ha sido completado exitosamente.",
      });
    } catch (error) {
      console.error('Error al completar perfil:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al completar tu perfil. Intenta nuevamente.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    completeProfile
  };
};
