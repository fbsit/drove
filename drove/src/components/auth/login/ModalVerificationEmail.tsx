// src/components/auth/login/ModalVerificationEmail.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;           // se dispara cuando el código es correcto
}

export const ModalVerificationEmail: React.FC<Props> = ({
  isOpen,
  email,
  onClose,
  onVerified,
}) => {
  const { sendVerificationCode, checkVerificationCode } = useAuth();

  /* ─── estado interno ─── */
  const [step, setStep] = useState<'intro' | 'code'>('intro');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  /* refs de inputs para manejar el foco */
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  /* ─── helpers ─── */
  const CODE_TTL = 10 * 60;                 // 10 min
  const format = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ─── reset al abrir ─── */
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setSecondsLeft(0);
      setCode('');
    }
  }, [isOpen]);

  /* ─── cuenta regresiva ─── */
  useEffect(() => {
    if (step !== 'code') return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1_000);
    return () => clearInterval(id);
  }, [step]);

  /* ─── enviar código ─── */
  const handleSendCode = async () => {
    setLoading(true);
    try {
      await sendVerificationCode(email);
      toast({ title: 'Código enviado', description: 'Revisa tu correo.' });
      setStep('code');
      setSecondsLeft(CODE_TTL);
    } catch {/* toast de error lo lanza el hook */ }
    finally { setLoading(false); }
  };

  /* ─── reenviar ─── */
  const handleResend = async () => {
    await handleSendCode();
  };

  /* ─── cambios en inputs ─── */
  const onChangeDigit = (idx: number, value: string) => {
    const clean = value.replace(/\D/, '');
    const newCode = code.substring(0, idx) + clean + code.substring(idx + 1);
    setCode(newCode);
    if (clean && idx < 5) inputsRef.current[idx + 1]?.focus();
  };
  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
  };

  /* ─── verificar código ─── */
  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await checkVerificationCode(email, code);
      toast({ title: 'Email verificado', description: '¡Validación exitosa!' });
      onVerified();          // avisa al contenedor (Login)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#22142A] text-white border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle>Verificación de correo</DialogTitle>
          {step === 'intro' ? (
            <DialogDescription className="text-white/70">
              Tu cuenta aún no está verificada. Presiona <b>Enviar código</b> para
              recibir un código de 6 dígitos en <span className="font-medium">{email}</span>.
            </DialogDescription>
          ) : (
            <DialogDescription className="text-white/70">
              Ingresa el código enviado a&nbsp;
              <span className="font-medium">{email}</span>. Expira en {format(secondsLeft)}.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Paso 2: inputs del código */}
        {step === 'code' && (
          <div className="flex justify-between gap-2 my-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                maxLength={1}
                inputMode="numeric"
                className="w-10 h-12 text-center text-lg bg-white/5 border-white/20 focus:ring-0"
                value={code[idx] || ''}
                onChange={(e) => onChangeDigit(idx, e.target.value)}
                onKeyDown={(e) => onKeyDown(idx, e)}
              />
            ))}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {step === 'intro' ? (
            <Button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Enviando…' : 'Enviar código'}
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                disabled={loading || secondsLeft === 0}
                onClick={handleResend}
                className="w-full sm:w-auto"
              >
                Reenviar código
              </Button>
              <Button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full sm:w-auto"
              >
                {loading ? 'Verificando…' : 'Verificar'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
