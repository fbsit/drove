
import React from 'react';
import DroveLogo from '@/components/DroveLogo';

export const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <DroveLogo size="md" className="mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
      <p className="text-white/70 mt-2">
        Accede a tu cuenta para gestionar tus traslados
      </p>
    </div>
  );
};
