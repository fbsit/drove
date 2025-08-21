
import React from 'react';
import { Smartphone, MapPin, FileCheck, QrCode, Shield, Clock } from 'lucide-react';

const TechFeature = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-drove-accent/50 transition-all">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-drove-accent/20 rounded-full flex items-center justify-center">
        <Icon size={24} className="text-drove-accent" />
      </div>
    </div>
    <div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  </div>
);

const TechnologySection = () => {
  const features = [
    {
      icon: Smartphone,
      title: "App móvil intuitiva",
      description: "Interfaz fácil de usar para drovers y clientes con notificaciones en tiempo real"
    },
    {
      icon: MapPin,
      title: "Tracking GPS en vivo",
      description: "Seguimiento preciso de la ubicación del vehículo durante todo el trayecto"
    },
    {
      icon: QrCode,
      title: "Verificación por QR",
      description: "Sistema seguro de verificación en recogida y entrega del vehículo"
    },
    {
      icon: FileCheck,
      title: "Firma digital",
      description: "Documentación completa con firmas digitales y fotografías del estado"
    },
    {
      icon: Shield,
      title: "Plataforma segura",
      description: "Encriptación de datos y protocolos de seguridad de nivel bancario"
    },
    {
      icon: Clock,
      title: "Soporte 24/7",
      description: "Asistencia técnica y operativa disponible en todo momento"
    }
  ];

  return (
    <section className="px-4 py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Tecnología de vanguardia
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Utilizamos la última tecnología para garantizar un servicio seguro, transparente y eficiente
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <TechFeature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
