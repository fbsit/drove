
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { DroveButton } from '@/components/DroveButton';
import { LoginHeader } from '@/components/auth/login/LoginHeader';
import { toast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';
const resetPasswordSchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^[A-Za-z0-9]{6}$/, 'El código debe contener solo letras y números'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: urlCode || '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = useCallback(async (values: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      
      await AuthService.resetPassword(values.code, values.password);
      
      setPasswordChanged(true);
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente',
      });
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar la contraseña. Verifica que el código sea válido.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-drove flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-white/70">
                Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión automáticamente.
              </p>
            </div>
            
            <DroveButton
              variant="accent"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Ir al Inicio de Sesión
            </DroveButton>
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
            Restablecer Contraseña
          </h2>
          <p className="text-white/70">
            {isValidCode ? 
              'Completa los campos para establecer tu nueva contraseña.' :
              'Ingresa el código de verificación y tu nueva contraseña.'
            }
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Código de Verificación</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP 
                        maxLength={6} 
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                          <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                          <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
                          <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                          <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                          <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-white/60 text-center">
                    {isValidCode ? 
                      `Código válido para: ${userEmail}` : 
                      'Ingresa el código de 6 dígitos que recibiste por email'
                    }
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nueva Contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-white/60">
                    Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center">
              <p className="text-sm text-white/60 mb-4">
                La contraseña se actualizará automáticamente cuando completes todos los campos correctamente
              </p>
              
              <DroveButton
                type="submit"
                variant="accent"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </DroveButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
