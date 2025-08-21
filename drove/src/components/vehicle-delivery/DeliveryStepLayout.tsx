
import React from 'react';
import { DeliveryStepKey } from '@/types/vehicle-transfer-db';
import { Loader, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stepConfig = {
  'deliverySummary': {
    title: 'Resumen de entrega',
    nextStep: 'exterior-photos' as DeliveryStepKey
  },
  'exteriorPhotos': {
    title: 'Fotos exteriores',
    nextStep: 'interiorPhotos' as DeliveryStepKey
  },
  'interiorPhotos': {
    title: 'Fotos interiores',
    nextStep: 'recipientIdentity' as DeliveryStepKey
  },
  'recipientIdentity': {
    title: 'Identidad del receptor',
    nextStep: 'finalHandover' as DeliveryStepKey
  },
  'finalHandover': {
    title: 'Entrega final',
    nextStep: 'confirmation' as DeliveryStepKey
  },
  'confirmation': {
    title: 'Confirmación',
    nextStep: null
  }
};

interface DeliveryStepLayoutProps {
  currentStep: DeliveryStepKey;
  children: React.ReactNode;
  isLoading?: boolean;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onSkipToStep?: (step: DeliveryStepKey) => void;
  isFinalStep?: boolean;
  isNextDisabled?: boolean;
  transferId: string;
  stepProgress: Record<DeliveryStepKey, boolean>;
}

const DeliveryStepLayout: React.FC<DeliveryStepLayoutProps> = ({
  currentStep,
  children,
  isLoading = false,
  onNextStep,
  onPrevStep,
  onSkipToStep,
  isFinalStep = false,
  isNextDisabled = false,
  transferId,
  stepProgress
}) => {

  console.log("current to set",currentStep);

  const currentStepConfig = stepConfig[currentStep];

  const completedSteps = Object.values(stepProgress).filter(Boolean).length;
  const totalSteps = Object.keys(stepProgress).length;
  const progressPercent = (completedSteps / totalSteps) * 100;


  console.log("currentStepConfig", currentStepConfig);
  
  return (
    <div className="bg-drove min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-drove/95 backdrop-blur-sm border-b border-white/10">
        <div className="container px-4 py-4">
          <h1 className="text-white text-xl font-bold text-center">
            {currentStepConfig?.title}
          </h1>
          
          <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#6EF7FF] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2">
            {Object.entries(stepProgress).map(([step, isComplete], index) => (
              <div 
                key={step}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => onSkipToStep?.(step as DeliveryStepKey)}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center 
                  ${currentStep === step ? 'bg-[#6EF7FF]' : 
                    isComplete ? 'bg-green-500' : 'bg-white/20'}`}>
                  {isComplete && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-white/50 mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow container px-4 py-6">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-drove/95 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="container flex justify-between max-w-md mx-auto">
          {onPrevStep && !isFinalStep && (
            <Button 
              variant="ghost"
              onClick={onPrevStep}
              disabled={isLoading}
              className="border-white/20 text-white"
            >
              Atrás
            </Button>
          )}
          
          {(!onPrevStep || isFinalStep) && <div></div>}
          
          {onNextStep && currentStepConfig?.nextStep && !isFinalStep && (
            <Button 
              variant="default"
              onClick={onNextStep}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Siguiente'
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DeliveryStepLayout;
