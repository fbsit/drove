import React from 'react';

const PendingApproval: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#22142A] text-white p-4 text-center">
      <h1 className="text-2xl font-semibold mb-4">Gracias por verificar tu correo</h1>
      <p className="max-w-xl text-white/80">
        Tu registro fue recibido correctamente y está siendo revisado por nuestro equipo. Te notificaremos por correo cuando tu cuenta sea aprobada o rechazada por el administrador.
      </p>
    </div>
  );
};

export default PendingApproval;


