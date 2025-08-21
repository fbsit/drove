
import React from 'react';
import { aboutContent } from '@/data/about-data';

const AboutHeroSection = () => {
  return (
    <section className="relative flex items-center justify-center pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-drove via-drove to-drove/80"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {aboutContent.hero.title}
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
          {aboutContent.hero.subtitle}
        </p>
      </div>
    </section>
  );
};

export default AboutHeroSection;
