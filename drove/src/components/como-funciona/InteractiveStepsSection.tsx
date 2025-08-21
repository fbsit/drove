
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { steps } from '@/data/como-funciona-data';

interface InteractiveStepsSectionProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const InteractiveStepsSection = ({ activeStep, setActiveStep }: InteractiveStepsSectionProps) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setActiveStep(index)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 text-lg font-bold ${
                    activeStep >= index
                      ? 'bg-drove-accent text-drove scale-110 shadow-lg'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {step.id}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-1 mx-2 transition-colors duration-300 ${
                    activeStep > index ? 'bg-drove-accent' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Step Card */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={`transition-all duration-500 ${
                activeStep === index
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-4 absolute'
              } ${step.color} bg-white backdrop-blur-sm rounded-2xl border overflow-hidden`}
              style={{ display: activeStep === index ? 'block' : 'none' }}
            >
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${step.color.includes('blue') ? 'bg-blue-500/30' : step.color.includes('green') ? 'bg-green-500/30' : step.color.includes('purple') ? 'bg-purple-500/30' : step.color.includes('orange') ? 'bg-orange-500/30' : 'bg-teal-500/30'}`}>
                      <step.icon size={32} className={step.iconColor} />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-gray-600">
                          <CheckCircle size={16} className={`${step.iconColor} mr-2`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center mt-8 gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Anterior
          </Button>
          <Button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
            className="bg-drove-accent hover:bg-drove-accent/90 text-drove"
          >
            Siguiente
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InteractiveStepsSection;
