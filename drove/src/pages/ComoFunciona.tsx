
import React, { useState } from 'react';
import HeroSection from '@/components/como-funciona/HeroSection';
import InteractiveStepsSection from '@/components/como-funciona/InteractiveStepsSection';
import BenefitsSection from '@/components/como-funciona/BenefitsSection';
import CTASection from '@/components/como-funciona/CTASection';

const ComoFunciona = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-drove">
      <HeroSection />
      <InteractiveStepsSection activeStep={activeStep} setActiveStep={setActiveStep} />
      <BenefitsSection />
      <CTASection />
    </div>
  );
};

export default ComoFunciona;
