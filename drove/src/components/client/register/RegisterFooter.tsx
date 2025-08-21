
import React from 'react';
import { Link } from 'react-router-dom';
import DroveButton from '@/components/DroveButton';

interface RegisterFooterProps {
  step: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

const RegisterFooter = ({ step, totalSteps, onPrevious, onNext }: RegisterFooterProps) => {
  // En el último paso (confirmación) mostramos solo un botón para volver al inicio
  if (step === totalSteps - 1) {
    return (
      <div className="w-full px-2">
        <Link to="/" className="block w-full">
          <DroveButton 
            type="button" 
            variant="default" 
            size="lg"
            className="w-full"
          >
            Volver al inicio
          </DroveButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full px-2">
      {step > 0 && (
        <DroveButton
          type="button"
          variant="outline"
          size="lg"
          className="w-full sm:flex-1 order-2 sm:order-1"
          onClick={onPrevious}
        >
          Anterior
        </DroveButton>
      )}
      {step < totalSteps - 2 ? (
        <DroveButton 
          type="button"
          variant="default" 
          size="lg"
          className="w-full sm:flex-1 order-1 sm:order-2"
          onClick={onNext}
        >
          Siguiente
        </DroveButton>
      ) : (
        <DroveButton 
          type="submit"
          variant="default" 
          size="lg"
          className="w-full sm:flex-1 order-1 sm:order-2"
        >
          Finalizar
        </DroveButton>
      )}
    </div>
  );
};

export default RegisterFooter;
