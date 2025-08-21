
import React from 'react';
import { Calendar, Smartphone, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import DroveButton from '@/components/DroveButton';

const BenefitCard = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-white/5 p-6 rounded-xl">
    <div className="w-12 h-12 bg-drove-accent/20 rounded-full flex items-center justify-center mb-4">
      <Icon size={24} className="text-drove-accent" />
    </div>
    <h3 className="font-bold text-white text-xl mb-2">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

const DriverBenefits = () => {
  const benefits = [
    {
      icon: Calendar,
      title: "Horarios flexibles",
      description: "Trabaja cuando quieras, tú decides tu disponibilidad y rutas preferidas"
    },
    {
      icon: Smartphone,
      title: "App intuitiva",
      description: "Acepta viajes y visualiza rutas fácilmente desde nuestra aplicación"
    },
    {
      icon: Users,
      title: "Comunidad DROVER",
      description: "Únete a una red de profesionales en constante crecimiento"
    }
  ];

  return (
    <section className="px-4 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold mb-12 text-center text-white">
          Beneficios para choferes
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/registro">
            <DroveButton variant="accent" size="lg">
              Postula como Drover
            </DroveButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DriverBenefits;
