
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  onNext?: () => void;
  onPrev?: () => void;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onNext,
  onPrev,
  isNextDisabled = false,
  isLastStep = false
}) => {
  return (
    <div className="flex justify-between pt-6">
      {currentStep > 0 && onPrev && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Anterior
        </Button>
      )}
      
      {onNext && (
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex items-center gap-2 ml-auto"
        >
          {isLastStep ? 'Finalizar' : 'Siguiente'}
          <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
