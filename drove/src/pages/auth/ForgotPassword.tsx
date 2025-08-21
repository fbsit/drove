
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DroveButton } from '@/components/DroveButton';
import { LoginHeader } from '@/components/auth/login/LoginHeader';
import { toast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      
      const resultForgot = await AuthService.forgotPassword(values.email);
      
      setEmailSent(true);
      toast({
        title: 'Email enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar el email. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-drove flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 rounded-2xl p-8">
          <LoginHeader />
          
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-[#6EF7FF]/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-[#6EF7FF]" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Email Enviado
              </h2>
              <p className="text-white/70">
                Te hemos enviado un enlace para restablecer tu contraseña a{' '}
                <span className="text-[#6EF7FF] font-medium">
                  {form.getValues('email')}
                </span>
              </p>
            </div>
            
            <div className="bg-[#6EF7FF]/10 rounded-xl p-4 border border-[#6EF7FF]/30">
              <p className="text-sm text-white/80">
                Si no recibes el email en unos minutos, revisa tu carpeta de spam o solicita uno nuevo.
              </p>
            </div>
            
            <div className="space-y-4">
              <DroveButton
                variant="accent"
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Enviar de nuevo
              </DroveButton>
              
              <Link to="/login" className="block">
                <DroveButton variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </DroveButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-drove flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 rounded-2xl p-8">
        <LoginHeader />
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Recuperar Contraseña
          </h2>
          <p className="text-white/70">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="correo@ejemplo.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DroveButton
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Email de Recuperación'
              )}
            </DroveButton>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-white/70 hover:text-[#6EF7FF] text-sm inline-flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
