
import React from 'react';
import { CheckCircle, Mail, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';

interface Props {
  onConfirm?: () => Promise<void>;
  isLoading?: boolean;
  data?: Partial<RegistrationFormData>;
  onPrevious?: () => void;
  errorMessage?: string | null;
}

const RegistrationConfirmation: React.FC<Props> = ({ 
  onConfirm, 
  isLoading = false,
  data = {},
  onPrevious,
  errorMessage = null,
}) => {
  if (errorMessage) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Helvetica' }}>No pudimos completar tu registro</h3>
        <p className="text-white/80 max-w-xl mx-auto">
          {errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-2xl border border-white/30 text-white px-4 py-2 hover:bg-white/10"
            >
              Volver y corregir
            </button>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-[#6EF7FF] text-[#22142A] font-bold px-4 py-2 hover:bg-[#58e7ef]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#6EF7FF]/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#6EF7FF] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Helvetica' }}>Finalizando tu registro…</h3>
        <p className="text-white/80 max-w-xl mx-auto">Estamos validando tus datos. Esto puede tardar unos segundos.</p>
      </div>
    );
  }
  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-[#6EF7FF]/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-[#6EF7FF]" />
        </div>
      </div>

      <div className="px-2">
        <h3 className="text-3xl font-extrabold text-white leading-tight" style={{ fontFamily: "Helvetica" }}>
          ¡Gracias por registrarte en
          <br />
          DROVE!
        </h3>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 text-center max-w-[448px] w-full mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-[#6EF7FF]" />
            <span className="text-white font-medium">Verificación de correo</span>
          </div>
          <p className="text-white/80 text-center leading-relaxed">
            Te hemos enviado un correo con un <span className="font-semibold">código de verificación</span>.
            Por favor, confirma tu correo para validar tu cuenta.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 text-center max-w-[448px] w-full mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#6EF7FF]" />
            <span className="text-white font-medium">Proceso de aprobación</span>
          </div>
          <p className="text-white/80 text-center leading-relaxed">
            Todas las cuentas deben ser <span className="font-semibold">aprobadas manualmente por nuestro equipo</span>
            antes de poder utilizar la plataforma.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-white/70 mt-2">
        <Clock className="w-4 h-4" />
        <span>Tiempo estimado de aprobación: 24-48 horas</span>
      </div>

      <p className="text-white/60 text-sm max-w-2xl mx-auto">
        Recibirás una notificación por correo electrónico cuando tu cuenta sea aprobada.
      </p>
    </div>
  );
};

export default RegistrationConfirmation;
