
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TrustSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Confía en los expertos
        </h2>
        <p className="text-white/70 text-lg mb-8 leading-relaxed">
          Con más de 100 drovers profesionales verificados y miles de traslados exitosos, 
          DROVE se ha consolidado como la plataforma más segura y confiable para el transporte de vehículos.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-drove-accent mb-2">99.9%</div>
            <p className="text-white/70">Traslados exitosos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-drove-accent mb-2">24/7</div>
            <p className="text-white/70">Soporte disponible</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-drove-accent mb-2">100+</div>
            <p className="text-white/70">Drovers verificados</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-drove-accent hover:bg-drove-accent/90 text-drove font-bold px-8 py-4 rounded-2xl text-lg"
            onClick={() => navigate('/solicitar-traslado')}
          >
            Solicitar Transporte Seguro
          </Button>
          <Button 
            variant="outline" 
            className="border-2 border-white/20 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-2xl text-lg"
            onClick={() => navigate('/como-funciona')}
          >
            Conocer más
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
