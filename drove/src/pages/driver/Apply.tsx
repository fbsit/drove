
import React from 'react';
import { useDriverApplication, STEPS } from '@/hooks/useDriverApplication';
import PersonalInfoStep from '@/components/driver-apply/PersonalInfoStep';
import AddressStep from '@/components/driver-apply/AddressStep';
import DocumentationStep from '@/components/driver-apply/DocumentationStep';
import ConfirmationStep from '@/components/driver-apply/ConfirmationStep';
import { FormProvider } from 'react-hook-form';
import StepNavigation from '@/components/driver-apply/StepNavigation';
import { Progress } from '@/components/ui/progress';

const DriverApply: React.FC = () => {
  const { step, form, onSubmit } = useDriverApplication();

  const stepProgress = ((step + 1) / Object.keys(STEPS).length) * 100;

  const stepTitles = {
    [STEPS.PERSONAL_INFO]: 'Información Personal',
    [STEPS.ADDRESS]: 'Dirección',
    [STEPS.DOCUMENTATION]: 'Documentación',
    [STEPS.CONFIRMATION]: 'Confirmación'
  };

  const renderStep = () => {
    switch (step) {
      case STEPS.PERSONAL_INFO:
        return <PersonalInfoStep form={form} />;
      case STEPS.ADDRESS:
        return <AddressStep form={form} />;
      case STEPS.DOCUMENTATION:
        return <DocumentationStep form={form} />;
      case STEPS.CONFIRMATION:
        return <ConfirmationStep onSubmit={onSubmit} />;
      default:
        return <PersonalInfoStep form={form} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Postular como Drover
            </h1>
            <p className="text-white/60">
              {stepTitles[step as keyof typeof stepTitles]}
            </p>
          </div>

          <div className="mb-8">
            <Progress value={stepProgress} className="w-full" />
            <div className="flex justify-between text-sm text-white/60 mt-2">
              <span>Paso {step + 1} de {Object.keys(STEPS).length}</span>
              <span>{Math.round(stepProgress)}% completado</span>
            </div>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit((data) => {
              console.log('Form submitted with data:', data);
            })}>
              {renderStep()}
              <StepNavigation currentStep={step} />
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default DriverApply;
