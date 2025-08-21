
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          ¿Listo para empezar?
        </h2>
        <p className="text-white/70 text-lg mb-8">
          Únete a miles de usuarios que confían en DROVE para el transporte de sus vehículos
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-drove-accent hover:bg-drove-accent/90 text-drove font-bold px-8 py-4 rounded-2xl text-lg"
            onClick={() => navigate('/solicitar-traslado')}
          >
            Solicitar Transporte
          </Button>
          <Button 
            variant="outline" 
            className="border-2 border-white/20 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-2xl text-lg"
            onClick={() => navigate('/postular')}
          >
            Ser Drover
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
