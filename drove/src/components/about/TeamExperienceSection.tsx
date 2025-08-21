
import React from 'react';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';
import { aboutContent, aboutStats } from '@/data/about-data';

const TeamExperienceSection = () => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="mb-8">
              <div className="w-16 h-1 bg-drove-accent mb-6"></div>
              <p className="text-drove-accent font-semibold text-lg mb-4">
                {aboutContent.teamExperience.sectionTitle}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                {aboutContent.teamExperience.title}
              </h2>
            </div>
            
            <div className="space-y-6 text-white/80 text-lg leading-relaxed">
              {aboutContent.teamExperience.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-10">
              <Button 
                className="bg-drove-accent hover:bg-drove-accent/90 text-drove font-bold px-8 py-4 rounded-2xl text-lg"
              >
                Contáctanos
              </Button>
            </div>
          </div>

          {/* Right Content - Stats y Visual */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {aboutStats.map((stat, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-drove-accent mb-2">{stat.value}</div>
                  <p className="text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-drove-accent/20 to-drove-accent/5 rounded-2xl p-8 border border-drove-accent/20">
              <h3 className="text-xl font-bold text-white mb-4">Tecnología de Vanguardia</h3>
              <p className="text-white/70 mb-6">
                Plataforma digital desarrollada con las últimas tecnologías para garantizar 
                la mejor experiencia de usuario y seguimiento en tiempo real.
              </p>
              <div className="flex items-center gap-2 text-drove-accent font-semibold">
                <Code size={20} />
                <span>
                  Desarrollado por{' '}
                  <a 
                    href="https://www.pictorica.es" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-drove-accent/80 transition-colors"
                  >
                    Pictórica
                  </a>
                </span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-3">Horario de Servicio</h4>
              <div className="space-y-2 text-white/70">
                <p><strong>Lunes a Viernes:</strong> {aboutContent.schedule.weekdays}</p>
                <p><strong>Sábados y Domingos:</strong> {aboutContent.schedule.weekends}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamExperienceSection;
