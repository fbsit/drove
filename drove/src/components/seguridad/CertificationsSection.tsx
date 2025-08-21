
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { certifications } from '@/data/seguridad-data';

const CertificationsSection = () => {
  return (
    <section className="py-16 px-4 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Certificaciones y Cumplimiento
          </h2>
          <p className="text-white/70 text-lg">
            Estándares internacionales de seguridad y calidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-drove-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <cert.icon size={24} className="text-drove-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {cert.title}
                </h3>
                <p className="text-white/70 text-sm">
                  {cert.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
