
import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<Props> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="mb-8">
      {/* Mobile Progress Bar */}
      <div className="block md:hidden mb-4">
        <div className="flex items-center justify-between text-white/70 text-sm mb-2">
          <span>Paso {currentStep + 1} de {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-[#6EF7FF] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicators */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-[#6EF7FF] border-[#6EF7FF] text-[#22142A]' 
                    : index === currentStep 
                    ? 'bg-[#6EF7FF]/20 border-[#6EF7FF] text-[#6EF7FF]' 
                    : 'bg-transparent border-white/30 text-white/50'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span 
                className={`text-xs mt-2 text-center max-w-20 transition-colors duration-300 ${
                  index <= currentStep ? 'text-white' : 'text-white/50'
                }`}
              >
                {step}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                  index < currentStep ? 'bg-[#6EF7FF]' : 'bg-white/20'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
