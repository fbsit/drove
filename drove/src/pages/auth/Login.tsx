
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/login/LoginForm';
import { LoginHeader } from '@/components/auth/login/LoginHeader';
import { LoginFooter } from '@/components/auth/login/LoginFooter';
import { ModalVerificationEmail } from '@/components/auth/login/ModalVerificationEmail';
import type { AuthSignInData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const {
    isLoading,
    isAuthenticated,
    user,
    login,
    getRedirectPathForUser
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Estados para el modal de verificación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  // Ref para almacenar credenciales pendientes y bandera de verificación
  const pendingCredentials = useRef<AuthSignInData | null>(null);
  const verifiedRef = useRef(false);

  // Redirección tras login exitoso - SOLO cuando tenemos usuario completo
  useEffect(() => {
    console.log("🔍 Login useEffect - isAuthenticated:", isAuthenticated, "user:", user);

    if (isAuthenticated && user && user.role) {
      console.log('✅ Usuario autenticado con role completo, redirigiendo:', user);
      const redirectTo = getRedirectPathForUser();
      console.log('🎯 Redirigiendo a:', redirectTo);

      navigate(redirectTo, { replace: true });

      toast({
        title: `Bienvenido, ${user?.full_name || user?.email?.split('@')[0]}`,
        description: 'Has iniciado sesión correctamente',
      });
    }
  }, [isAuthenticated, user, navigate, getRedirectPathForUser]);

  // Maneja el envío del formulario de login
  const handleSubmit = async (values: AuthSignInData) => {
    try {
      console.log('🔑 Intentando login con:', values);
      const result = await login(values);
      console.log('✅ Login completado exitosamente', result);
      // El useEffect anterior se encarga de redirigir una vez que tenemos el usuario completo
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      // Detectamos el código que indica validación de email requerida
      if (
        err?.status === 401 &&
        err.message === 'Email no verificado'
      ) {
        pendingCredentials.current = values;
        setVerificationEmail(values.email);
        setIsModalOpen(true);
      } else if (err.message.includes('Usuario no aprobado')) {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: err?.message || 'Credenciales incorrectas',
        });
      } else if (err.message.includes('Email no verificado')) {
        //Levantar modal de verificación
        pendingCredentials.current = values;
        setVerificationEmail(values.email);
        setIsModalOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: err?.message || 'Credenciales incorrectas',
        });
      }
    }
  };

  // Callback que recibe ModalVerificationEmail cuando la verificación es exitosa
  const handleVerified = () => {
    verifiedRef.current = true;
    setIsModalOpen(false);
  };

  // Reintentar login tras cierre del modal y verificación
  useEffect(() => {
    if (!isModalOpen && verifiedRef.current && pendingCredentials.current) {
      const creds = pendingCredentials.current;
      // limpiamos antes de iniciar el login para evitar múltiples intentos si
      // el servicio tarda en responder
      verifiedRef.current = false;
      pendingCredentials.current = null;
      login(creds);
    }
  }, [isModalOpen]);

  // Si ya está autenticado con datos completos, redirigimos de inmediato
  if (isAuthenticated && user && user.role) {
    const redirectTo = getRedirectPathForUser();
    console.log('🚀 Redirect inmediato a:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-drove flex items-center justify-center p-4 py-20">
      <div className="max-w-md w-full bg-white/10 rounded-2xl p-8">
        <LoginHeader />
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        <ModalVerificationEmail
          isOpen={isModalOpen}
          email={verificationEmail}
          onClose={() => setIsModalOpen(false)}
          onVerified={handleVerified}
        />
        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;
