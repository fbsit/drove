import React from "react";
import { Link } from "react-router-dom";
import { User, Car } from "lucide-react";
import DroveButton from "@/components/DroveButton";

const HeroSection = () => {
  return (
    <section className="px-4 pb-20 text-center relative overflow-hidden">
      {/* Contenido principal */}
      <div className="relative z-10">
        <div className="inline-block bg-drove-accent/10 border border-drove-accent/30 rounded-full px-4 py-2 mb-6">
          <span className="text-drove-accent font-medium text-sm">
            🚗 +1.000 transportes exitosos
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
          Transporte profesional de
          <span className="text-drove-accent block mt-2">
            vehículos en España
          </span>
        </h1>

        <p className="text-white/80 max-w-3xl mx-auto mb-12 text-lg md:text-xl leading-relaxed">
          Conectamos a <strong>clientes</strong> que necesitan transportar
          vehículos con
          <strong> drovers profesionales verificados</strong>. Seguridad,
          transparencia y tecnología de vanguardia.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Para Clientes */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-drove-accent/50 transition-all group">
            <div className="w-16 h-16 bg-drove-accent/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <Car size={32} className="text-drove-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              ¿Necesitas transportar tu vehículo?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Solicita el transporte de tu coche, furgoneta o moto con
              profesionales verificados. Seguimiento GPS en tiempo real y total
              seguridad garantizada.
            </p>
            <Link to="/registro/client">
              <DroveButton
                variant="accent"
                size="lg"
                className="w-full group-hover:scale-105 transition-transform"
              >
                Solicitar transporte
              </DroveButton>
            </Link>
          </div>

          {/* Para Drovers */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-drove-accent/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-drove-accent/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <User size={32} className="text-drove-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                ¿Conduces tu futuro?
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Únete a nuestra red de drovers profesionales. Horarios
                flexibles, pagos seguros y una plataforma que te ayuda a crecer.
              </p>
            </div>
            <Link to="/registro/drover">
              <DroveButton
                variant="accent"
                size="lg"
                className="w-full group-hover:scale-105 transition-transform"
              >
                Postular como Drover
              </DroveButton>
            </Link>
          </div>
        </div>

        {/* Indicadores de confianza */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-drove-accent mb-2">
              2+
            </div>
            <div className="text-white/70 text-sm">Años de experiencia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-drove-accent mb-2">
              1000+
            </div>
            <div className="text-white/70 text-sm">Transportes exitosos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-drove-accent mb-2">
              150+
            </div>
            <div className="text-white/70 text-sm">Drovers verificados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-drove-accent mb-2">
              50+
            </div>
            <div className="text-white/70 text-sm">Ciudades cubiertas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
