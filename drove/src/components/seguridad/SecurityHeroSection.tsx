
import React from 'react';
import { Shield } from 'lucide-react';

const SecurityHeroSection = () => {
  return (
    <section className="relative pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 bg-drove-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Shield size={40} className="text-drove-accent" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Tu seguridad es nuestra prioridad
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
          Sistemas de seguridad multicapa para proteger tu vehículo en cada kilómetro
        </p>
      </div>
    </section>
  );
};

export default SecurityHeroSection;
