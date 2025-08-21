
import React from 'react';
import { TrendingUp, Users, MapPin, Clock } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const StatCard = ({ icon: Icon, title, value, suffix = '', description }: {
  icon: React.ElementType;
  title: string;
  value: number;
  suffix?: string;
  description: string;
}) => (
  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center hover:border-drove-accent/50 transition-all">
    <div className="w-16 h-16 bg-drove-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon size={32} className="text-drove-accent" />
    </div>
    <div className="text-3xl font-bold text-white mb-2">
      <AnimatedCounter end={value} suffix={suffix} />
    </div>
    <h3 className="text-xl font-bold text-drove-accent mb-2">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

const StatsSection = () => {
  const stats = [
    {
      icon: Clock,
      title: "Años de experiencia",
      value: 2,
      suffix: "+",
      description: "Especializados en transporte profesional de vehículos"
    },
    {
      icon: TrendingUp,
      title: "Transportes completados",
      value: 1000,
      suffix: "+",
      description: "Traslados exitosos con total seguridad y confianza"
    },
    {
      icon: Users,
      title: "Drovers verificados",
      value: 150,
      suffix: "+",
      description: "Profesionales certificados en toda España"
    },
    {
      icon: MapPin,
      title: "Ciudades cubiertas",
      value: 50,
      suffix: "+",
      description: "Cobertura nacional completa"
    }
  ];

  return (
    <section className="px-4 py-16 md:py-20 bg-gradient-to-b from-drove to-drove/80">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-white">
          Números que nos respaldan
        </h2>
        <p className="text-center text-white/70 mb-12 max-w-2xl mx-auto">
          La confianza de nuestros clientes nos convierte en líderes del sector
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
