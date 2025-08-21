
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const EditEmailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentEmail,
}) => {
  const { sendVerificationCode, checkVerificationCode } = useAuth();
  const [step, setStep] = useState<'email' | 'verification'>('email');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cuenta regresiva para reenvío
  React.useEffect(() => {
    if (step !== 'verification' || secondsLeft === 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  const handleEmailSubmit = async () => {
    if (!newEmail || newEmail === currentEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Introduce un email diferente al actual.",
      });
      return;
    }

    setLoading(true);
    try {
      await sendVerificationCode(newEmail);
      setStep('verification');
      setSecondsLeft(300); // 5 minutos
      toast({
        title: "Código enviado",
        description: `Hemos enviado un código de verificación a ${newEmail}`,
      });
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El código debe tener 6 dígitos.",
      });
      return;
    }

    setLoading(true);
    try {
      await checkVerificationCode(newEmail, verificationCode);
      toast({
        title: "Email actualizado",
        description: "Tu correo electrónico ha sido actualizado exitosamente.",
      });
      onClose();
      // Aquí se actualizaría el email en el perfil
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await sendVerificationCode(newEmail);
      setSecondsLeft(300);
      toast({
        title: "Código reenviado",
        description: "Hemos enviado un nuevo código de verificación.",
      });
    } catch (error) {
      // El error ya se maneja en el hook
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('email');
    setNewEmail('');
    setVerificationCode('');
    setSecondsLeft(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="bg-[#22142A] text-white border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={20} className="text-[#6EF7FF]" />
            Cambiar Email
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {step === 'email' 
              ? "Introduce tu nuevo correo electrónico. Te enviaremos un código de verificación."
              : `Introduce el código de 6 dígitos enviado a ${newEmail}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'email' ? (
            <>
              <div>
                <Label htmlFor="currentEmail" className="text-white/80">Email actual</Label>
                <Input
                  id="currentEmail"
                  value={currentEmail}
                  disabled
                  className="bg-white/5 border-white/10 text-white/60 mt-1 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="newEmail" className="text-white/80">Nuevo email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="nuevo@correo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white mt-1 rounded-2xl"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-blue-300 mb-2">
                  <Shield size={16} />
                  <span className="font-medium">Verificación de seguridad</span>
                </div>
                <p className="text-white/70 text-sm">
                  Por seguridad, necesitamos verificar que tienes acceso al nuevo email.
                </p>
              </div>

              <div>
                <Label htmlFor="verificationCode" className="text-white/80">Código de verificación</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="bg-white/5 border-white/20 text-white mt-1 rounded-2xl text-center text-lg tracking-widest"
                />
              </div>

              {secondsLeft > 0 && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Clock size={14} />
                  <span>El código expira en {formatTime(secondsLeft)}</span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {step === 'email' ? (
            <>
              <Button 
                variant="outline" 
                onClick={resetAndClose}
                className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleEmailSubmit}
                disabled={loading || !newEmail}
                className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleResendCode}
                disabled={loading || secondsLeft > 0}
                className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
              >
                {secondsLeft > 0 ? `Reenviar (${formatTime(secondsLeft)})` : 'Reenviar código'}
              </Button>
              <Button 
                onClick={handleVerificationSubmit}
                disabled={loading || verificationCode.length !== 6}
                className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
