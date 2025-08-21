
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { securityFeatures } from '@/data/seguridad-data';

const SecurityFeaturesSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Medidas de Seguridad Integral
          </h2>
          <p className="text-white/70 text-lg">
            Protección completa en cada paso del proceso
          </p>
        </div>

        {/* Grid responsive - stack en móvil, 2 columnas en desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className={`${feature.color} bg-white backdrop-blur-sm rounded-2xl border overflow-hidden hover:scale-105 transition-all duration-300`}>
              <CardContent className="p-6 lg:p-8">
                {/* Layout móvil: centrado vertical, desktop: horizontal */}
                <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:gap-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 mb-4 lg:mb-0 ${feature.color.includes('blue') ? 'bg-blue-500/30' : feature.color.includes('green') ? 'bg-green-500/30' : feature.color.includes('purple') ? 'bg-purple-500/30' : 'bg-orange-500/30'}`}>
                    <feature.icon size={24} className={feature.iconColor} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-xl font-bold text-gray-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start lg:items-center text-gray-600 text-sm">
                          <CheckCircle size={14} className={`${feature.iconColor} mr-2 flex-shrink-0 mt-0.5 lg:mt-0`} />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityFeaturesSection;
