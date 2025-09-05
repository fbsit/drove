
import React from 'react';
import { Car, CheckCircle, MapPin, FileText, Clock, Shield } from 'lucide-react';

const BenefitCard = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center p-6">
    <div className="w-16 h-16 bg-drove-accent/20 rounded-full flex items-center justify-center mb-4">
      <Icon size={28} className="text-drove-accent" />
    </div>
    <h3 className="font-bold text-white mb-2">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

const ClientBenefits = () => {
  const benefits = [
    {
      icon: Car,
      title: "Transporte profesional puerta a puerta",
      description: "Recogida y entrega en las direcciones que indiques, sin desplazamientos adicionales"
    },
    {
      icon: CheckCircle,
      title: "Choferes verificados",
      description: "Todos nuestros conductores pasan por un riguroso proceso de validación"
    },
    {
      icon: MapPin,
      title: "Seguimiento en tiempo real",
      description: "Controla la ubicación de tu vehículo en todo momento a través de nuestra app"
    },
    {
      icon: FileText,
      title: "Firma digital y fotos",
      description: "Documentación completa del estado del vehículo antes y después del transporte"
    },
    {
      icon: Clock,
      title: "2 años de experiencia",
      description: "Más de 1.000 transportes completados con éxito en toda España"
    },
    {
      icon: Shield,
      title: "Seguridad garantizada",
      description: "Tu vehículo está protegido durante todo el trayecto con los mejores profesionales"
    }
  ];

  return (
    <section className="px-4 py-16 md:py-20 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold mb-12 text-center text-white">
          Beneficios para clientes
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientBenefits;
