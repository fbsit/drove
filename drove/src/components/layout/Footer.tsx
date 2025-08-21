
import React from 'react';
import DroveLogo from '@/components/DroveLogo';

const Footer = () => {
  return (
    <footer className="p-8 flex flex-col items-center border-t border-white/10">
      <DroveLogo size="lg" className="opacity-50 hover:opacity-100 transition-opacity mb-6" />
      <div className="text-white/40 text-sm text-center">
        <p className="mb-2">© {new Date().getFullYear()} DROVE - Transporte profesional de vehículos</p>
        <p>2 años de experiencia | +1.000 transportes exitosos | Servicio en toda España</p>
      </div>
    </footer>
  );
};

export default Footer;
