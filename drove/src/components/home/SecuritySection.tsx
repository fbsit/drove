
import React from 'react';
import { FileText, MapPin, CheckCircle, Send, Shield } from 'lucide-react';

const SecurityFeature = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-drove/70 p-6 rounded-xl flex gap-4 w-full xl:max-w-[48%] text-left">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-drove-accent/20 rounded-full flex items-center justify-center">
        <Icon size={24} className="text-drove-accent" />
      </div>
    </div>
    <div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  </div>
);

const SecuritySection = () => {
  const features = [
    {
      icon: FileText,
      title: "Documentación completa",
      description: "Captura de firma y fotos antes y después del transporte para documentar el estado del vehículo"
    },
    {
      icon: MapPin,
      title: "Geolocalización",
      description: "Seguimiento en tiempo real de la posición de tu vehículo durante todo el trayecto"
    },
    {
      icon: CheckCircle,
      title: "Validación por QR",
      description: "Sistema de verificación seguro mediante códigos QR en la recogida y entrega"
    },
    {
      icon: Send,
      title: "Confirmación por email",
      description: "Recibe PDF detallado con toda la información del retiro y entrega del vehículo"
    },
    {
      icon: Shield,
      title: "Plataforma auditada",
      description: "Sistema completo de seguridad con soporte activo para cualquier consulta durante el proceso"
    }
  ];

  return (
    <section className="px-4 pt-16 md:pt-20 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center text-white">
          Seguridad y confianza
        </h2>
        <p className="text-center text-white/70 mb-12 max-w-2xl mx-auto">
          En DROVE nos tomamos muy en serio la seguridad de tu vehículo y la transparencia en cada paso del proceso
        </p>

        <div className="flex flex-wrap gap-8 justify-center">
          {features.map((feature, index) => (
            <SecurityFeature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
