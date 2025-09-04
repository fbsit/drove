
import React from 'react';
import { CheckCircle, Mail, ShieldCheck, Clock } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';

interface Props {
  onConfirm?: () => Promise<void>;
  isLoading?: boolean;
  data?: Partial<RegistrationFormData>;
  onPrevious?: () => void;
}

const RegistrationConfirmation: React.FC<Props> = ({ 
  onConfirm, 
  isLoading = false,
  data = {},
  onPrevious
}) => {
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
