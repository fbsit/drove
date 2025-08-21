
import React from 'react';
import { Link } from 'react-router-dom';
import DroveButton from '@/components/DroveButton';

const PromoBanner = () => {
  return (
    <section className="bg-drove-accent text-drove p-4 md:p-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h3 className="font-bold">Transporte seguro y profesional</h3>
          <p className="font-medium">Realizamos transportes de vehículos en toda España</p>
        </div>
        <Link to="/registro">
          <DroveButton 
            variant="default" 
            className="bg-drove border-drove hover:bg-drove/80"
          >
            Contáctanos
          </DroveButton>
        </Link>
      </div>
    </section>
  );
};

export default PromoBanner;
