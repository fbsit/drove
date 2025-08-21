
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import { emergencySteps } from '@/data/seguridad-data';

const EmergencyProtocolSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Protocolo de Emergencia
          </h2>
          <p className="text-white/70 text-lg">
            Respuesta inmediata ante cualquier situación imprevista
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emergencySteps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon size={24} className="text-red-400" />
                  </div>
                  <div className="w-8 h-8 bg-drove-accent rounded-full flex items-center justify-center mx-auto mb-4 text-drove font-bold text-sm">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {index < emergencySteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <div className="w-6 h-1 bg-drove-accent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Contact */}
        <div className="mt-12 text-center">
          <Card className="bg-red-500/10 border-red-500/30 rounded-2xl max-w-md mx-auto">
            <CardContent className="p-6">
              <Phone size={32} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Línea de Emergencia 24/7
              </h3>
              <p className="text-2xl font-bold text-drove-accent mb-2">
                +34 611 59 14 29
              </p>
              <p className="text-white/70 text-sm">
                Disponible las 24 horas, los 7 días de la semana
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EmergencyProtocolSection;
