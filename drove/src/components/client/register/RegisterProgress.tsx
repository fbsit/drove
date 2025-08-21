
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface RegisterProgressProps {
  currentStep: number;
  totalSteps: number;
}

const RegisterProgress = ({ currentStep, totalSteps }: RegisterProgressProps) => {
  return (
    <>
      <p className="text-gray-300 mb-4">
        Paso {currentStep + 1} de {totalSteps}
      </p>
      <Progress value={((currentStep + 1) / totalSteps) * 100} className="w-full" />
    </>
  );
};

export default RegisterProgress;
