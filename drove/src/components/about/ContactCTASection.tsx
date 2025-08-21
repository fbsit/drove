
import React from 'react';
import { Button } from '@/components/ui/button';
import { aboutContent } from '@/data/about-data';

const ContactCTASection = () => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          {aboutContent.contact.title}
        </h2>
        <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          {aboutContent.contact.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            className="bg-drove-accent hover:bg-drove-accent/90 text-drove font-bold px-10 py-4 rounded-2xl text-lg"
          >
            Solicitar Transporte
          </Button>
          <Button 
            variant="outline"
            className="border-2 border-white/20 text-white hover:bg-white/10 font-bold px-10 py-4 rounded-2xl text-lg"
          >
            Ser Drover
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactCTASection;
