
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  isLastStep?: boolean;
}

const StepNavigation: React.FC<Props> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  isLoading = false,
  isLastStep = false
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isLoading}
        className="order-2 md:order-1 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      <Button
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className="order-1 md:order-2 flex items-center gap-2 bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold"
      >
        {isLoading ? (
          'Procesando...'
        ) : isLastStep ? (
          'Finalizar Registro'
        ) : (
          <>
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default StepNavigation;
