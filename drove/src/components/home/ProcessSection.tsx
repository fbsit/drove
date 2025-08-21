
import React from 'react';
import { 
  User, Send, Users, MapPin, Car, Calendar, Star
} from 'lucide-react';

const ProcessStep = ({ icon: Icon, title, desc }: { 
  icon: React.ElementType;
  title: string;
  desc: string;
  }) => (
  <div className="bg-white/5 p-6 rounded-xl text-center">
    <div className="w-12 h-12 bg-drove-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon size={24} className="text-drove-accent" />
    </div>
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-white/70 text-sm">{desc}</p>
  </div>
);

const ProcessSection = () => {
  const clientSteps = [
    { icon: Send, title: "Solicita", desc: "Pide el traslado de tu vehículo" },
    { icon: Users, title: "Asignamos chofer", desc: "Verificado y profesional" },
    { icon: MapPin, title: "Seguimiento", desc: "En tiempo real" },
    { icon: Car, title: "Recibe", desc: "Tu vehículo en destino" }
  ];

  const driverSteps = [
    { icon: User, title: "Postula", desc: "Completa tu registro" },
    { icon: Calendar, title: "Acepta transportes", desc: "Según tu disponibilidad" },
    { icon: MapPin, title: "Sigue la ruta", desc: "Con la app de DROVE" },
    { icon: Star, title: "Recibe tu pago", desc: "Rápido y seguro" }
  ];

  return (
    <section className="px-4 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold mb-12 text-center text-white">¿Cómo funciona?</h2>
        
        <div className="mb-16">
          <h3 className="text-xl font-bold mb-6 text-drove-accent flex items-center gap-2">
            <User size={24} />
            Para clientes
          </h3>
          <div className="grid md:grid-cols-4 gap-4 md:gap-8">
            {clientSteps.map((step, index) => (
              <ProcessStep key={`client-${index}`} {...step} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-6 text-drove-accent flex items-center gap-2">
            <Car size={24} />
            Para choferes
          </h3>
          <div className="grid md:grid-cols-4 gap-4 md:gap-8">
            {driverSteps.map((step, index) => (
              <ProcessStep key={`driver-${index}`} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
