import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';          // ya lo tienes
import { toast } from '@/hooks/use-toast';                 // idem
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type Status = 'checking' | 'success' | 'error' | 'expired' | 'missing';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { checkVerificationCode, sendVerificationCode } = useAuth();

  const email = search.get('email') ?? undefined;
  const code = search.get('code') ?? undefined;

  const [status, setStatus] = useState<Status>('checking');
  const [loading, setLoading] = useState(false);

  /* ───────── intenta verificar solo una vez ───────── */
  const attemptedRef = useRef(false);
  useEffect(() => {
    if (attemptedRef.current) return;
    if (!email || !code) { setStatus('missing'); return; }
    attemptedRef.current = true;

    (async () => {
      setLoading(true);
      try {
        await checkVerificationCode(email, code);
        toast({ title: 'Correo verificado', description: '¡Tu correo fue validado correctamente!' });
        setStatus('success');
        setTimeout(() => navigate('/'), 3000);
      } catch (err: any) {
        if (err?.response?.status === 410) setStatus('expired');
        else setStatus('error');
      } finally {
        setLoading(false);
      }
    })();
  }, [email, code]);

  /* ───────── reenviar código si falla / expira ───────── */
  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendVerificationCode(email);
      toast({ title: 'Nuevo código enviado', description: 'Revisa tu correo.' });
    } finally {
      setLoading(false);
    }
  };

  /* ───────── UI helper ───────── */
  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="mt-4">Verificando tu correo…</p>
          </>
        );
      case 'success':
        return (
          <p className="text-green-500">
            ¡Correo verificado! Serás redirigido en unos segundos…
          </p>
        );
      case 'expired':
        return (
          <>
            <p className="text-yellow-500">El código expiró. Solicita uno nuevo.</p>
            <Button className="mt-4" onClick={handleResend} disabled={loading}>
              {loading ? 'Enviando…' : 'Reenviar código'}
            </Button>
          </>
        );
      case 'error':
        return (
          <>
            <p className="text-red-500">
              El código es incorrecto o ya fue usado.
            </p>
            <Button className="mt-4" onClick={handleResend} disabled={loading}>
              {loading ? 'Enviando…' : 'Reenviar código'}
            </Button>
          </>
        );
      case 'missing':
      default:
        return <p>Faltan parámetros en la URL.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#22142A] text-white p-4">
      <h1 className="text-2xl font-semibold mb-6">Verificación de correo</h1>
      {renderContent()}
    </div>
  );
}
