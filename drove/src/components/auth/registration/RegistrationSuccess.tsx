
import React from 'react';
import { Loader } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  return (
    <div className="max-w-md w-full bg-white/10 rounded-2xl p-8 text-center">
      <div className="bg-[#6EF7FF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 border border-[#6EF7FF]/30">
        <svg className="h-8 w-8 text-[#6EF7FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">¡Registro Exitoso!</h1>
      <p className="text-white/70 mt-4 mb-6">
        Tu cuenta ha sido creada correctamente. Te estamos redirigiendo al inicio de sesión...
      </p>
      <Loader className="h-6 w-6 animate-spin mx-auto text-white/50" />
    </div>
  );
};
