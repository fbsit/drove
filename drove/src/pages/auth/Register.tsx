
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import RegisterHeader from '@/components/client/register/RegisterHeader';
import NewRegistrationForm from '@/components/auth/NewRegistrationForm';
import MobileRegistrationForm from '@/components/auth/MobileRegistrationForm';
import { RegistrationFormData } from '@/types/new-registration';

const Register = () => {
  const navigate = useNavigate();
  const { userType: paramUserType } = useParams<{ userType?: string }>();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleRegistrationComplete = async (formData: RegistrationFormData) => {
    try {
      setIsLoading(true);
      console.log('Registro completado exitosamente:', formData);
      
      toast({
        title: "¡Bienvenido a DROVE!",
        description: "Tu cuenta ha sido creada exitosamente. Te contactaremos pronto para activar tu cuenta.",
      });
      
      // Redirigir al login con mensaje de éxito
      navigate('/login', { 
        state: { 
          message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
          email: formData.email 
        }
      });
    } catch (error: any) {
      console.error('Error en el registro:', error);
      
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: error?.message || "No se pudo completar el registro. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar versión móvil sin header
  if (isMobile) {
    return (
      <MobileRegistrationForm
        onComplete={handleRegistrationComplete}
        isLoading={isLoading}
      />
    );
  }

  // Renderizar versión desktop con header
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] flex flex-col">
      <RegisterHeader />
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <NewRegistrationForm
          onComplete={handleRegistrationComplete}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Register;
