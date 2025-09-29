import React, { useEffect, useState } from "react";
import { UserType, RegistrationFormData } from "@/types/new-registration";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/authService";

// Importar los pasos existentes
import MobileUserTypeSelection from "./registration-steps/MobileUserTypeSelection";
import ClientBasicDataStep from "./registration-steps/ClientBasicDataStep";
import ClientFiscalDataStep from "./registration-steps/ClientFiscalDataStep";
import DroverPersonalDataStep from "./registration-steps/DroverPersonalDataStep";
import DroverIdentificationStep from "./registration-steps/DroverIdentificationStep";
import DroverDocumentationStep from "./registration-steps/DroverDocumentationStep";
import RegistrationConfirmation from "./registration-steps/RegistrationConfirmation";

interface Props {
  onComplete: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

const MobileRegistrationForm: React.FC<Props> = ({
  onComplete,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [externalErrors, setExternalErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const getSteps = () => {
    if (!userType) return ["Tipo de cuenta"];

    if (userType === "client") {
      return [
        "Tipo de cuenta",
        "Datos básicos",
        "Datos fiscales",
        "Confirmación",
      ];
    }

    return [
      "Tipo de cuenta",
      "Datos personales",
      "Identificación",
      "Documentación",
      "Confirmación",
    ];
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setFormData({ userType: type });
    setCurrentStep(1);
  };

  const handleStepData = (stepData: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.userType || !isFormComplete() || submitting) return;
    setSubmitting(true);
    try {
      // Preparar payload para AuthService.signUp (mismo mapping que desktop)
      const registrationData = {
        email: formData.email!,
        password: formData.password!,
        userType: formData.userType,
        contactInfo: {
          fullName: formData.fullName || "",
          phone: formData.phone || "",
          documentId: formData.documentNumber || "",
          documentType: formData.documentType || "DNI",
          address: formData.address || "",
          city: formData.city || "",
          state: formData.province || "",
          zip: formData.postalCode || "",
          country: formData.country || "España",
          // Para drover esperamos URLs en el formData (los pasos ya subieron los archivos)
          licenseFront: formData.licenseFront as any,
          licenseBack: formData.licenseBack as any,
          selfie: formData.profilePhoto as any,
          imageUpload2: formData.backgroundCheck as any,
          pdfUpload: formData.backgroundCheck as any,
          profileComplete: true,
        },
      };

      const res = await AuthService.signUp(registrationData as any);
      setSubmissionError(null);
      await onComplete(formData as RegistrationFormData);
    } catch (e: any) {
      console.error("Error registrando usuario (mobile):", e);
      const msg = e?.message || 'No se pudo completar el registro. Verifica tus datos.';
      try {
        const { toast } = await import('@/hooks/use-toast');
        toast({ variant: 'destructive', title: 'Error en registro', description: msg });
      } catch {}
      setSubmissionError(msg);

      // Mapeo de error → campos del paso fiscal para permitir corrección
      const lower = String(msg).toLowerCase();
      const nextErrors: Record<string, string> = {};
      if (lower.includes('dni inválido') || lower.includes('nie inválido') || lower.includes('cif inválido')) {
        nextErrors.documentNumber = msg;
      }
      setExternalErrors(nextErrors);

      // Volver al paso "Datos fiscales" si hubo error en documento
      if (nextErrors.documentNumber) {
        setCurrentStep(userType === 'client' ? 2 : currentStep);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = () => {
    const data = formData;
    if (!data.userType) return false;

    const baseFields = ["fullName", "email", "phone", "password"];
    const hasBaseFields = baseFields.every(
      (field) => data[field as keyof typeof data]
    );

    if (data.userType === "client") {
      return hasBaseFields && data.documentNumber && data.address;
    }

    if (data.userType === "drover") {
      return (
        hasBaseFields &&
        data.documentType &&
        data.documentNumber &&
        data.address &&
        data.profilePhoto &&
        data.licenseFront &&
        data.licenseBack &&
        data.backgroundCheck
      );
    }

    return false;
  };

  const getStepProgress = () => {
    return Math.round((currentStep / (totalSteps - 1)) * 100);
  };

  // Auto-enviar al llegar al último paso cuando todo está completo (alineado con desktop)
  useEffect(() => {
    const isOnLast = currentStep === totalSteps - 1;
    const isSupported = !!userType;
    if (isSupported && isOnLast && isFormComplete() && !submitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, userType]);

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return <MobileUserTypeSelection onSelect={handleUserTypeSelect} />;
    }

    if (!userType) return null;

    if (userType === "client") {
      switch (currentStep) {
        case 1:
          return (
            <ClientBasicDataStep
              data={formData}
              onUpdate={handleStepData}
              onNext={handleNext}
            />
          );
        case 2:
          return (
            <ClientFiscalDataStep
              data={formData}
              onUpdate={handleStepData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              externalErrors={externalErrors}
            />
          );
        case 3:
          return (
            <RegistrationConfirmation
              onConfirm={handleSubmit}
              isLoading={true}
              data={formData}
              onPrevious={handlePrevious}
              errorMessage={submissionError}
            />
          );
        default:
          return null;
      }
    }

    if (userType === "drover") {
      switch (currentStep) {
        case 1:
          return (
            <DroverPersonalDataStep
              data={formData}
              onUpdate={handleStepData}
              onNext={handleNext}
            />
          );
        case 2:
          return (
            <DroverIdentificationStep
              data={formData}
              onUpdate={handleStepData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          );
        case 3:
          return (
            <DroverDocumentationStep
              data={formData}
              onUpdate={handleStepData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          );
        case 4:
          return (
            <RegistrationConfirmation
              onConfirm={handleSubmit}
              isLoading={isLoading}
              data={formData}
              onPrevious={handlePrevious}
            />
          );
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div className="pt-36 min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] flex flex-col">
      {/* Header móvil fijo */}
      <div className="fixed top-0 left-0 right-0 bg-[#22142A] z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={
              currentStep > 0 ? handlePrevious : () => window.history.back()
            }
            className="text-white/70 hover:text-white p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {userType && (
            <span className="text-white/60 text-sm font-medium">
              {currentStep + 1} de {totalSteps}
            </span>
          )}
        </div>

        {/* Progress bar móvil */}
        {userType && (
          <>
            <div className="my-2">
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-[#6EF7FF] h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
            </div>

            <h1 className="text/base font-bold text-white truncate">
              {steps[currentStep]}
            </h1>
          </>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 pb-4">
        <div className="px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileRegistrationForm;
