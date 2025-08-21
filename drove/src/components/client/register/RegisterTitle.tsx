
import React from 'react';

interface RegisterTitleProps {
  isCompletingProfile: boolean;
}

const RegisterTitle = ({ isCompletingProfile }: RegisterTitleProps) => {
  return (
    <h1 className="text-4xl font-bold mb-4 font-helvetica">
      {isCompletingProfile ? "Completar Perfil de Cliente" : "Registro de Cliente"}
    </h1>
  );
};

export default RegisterTitle;
