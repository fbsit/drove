import React, { useState, useEffect } from "react";
import { UserType, RegistrationFormData } from "@/types/new-registration";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import UserTypeSelection from "./registration-steps/UserTypeSelection";
import ClientBasicDataStep from "./registration-steps/ClientBasicDataStep";
import ClientFiscalDataStep from "./registration-steps/ClientFiscalDataStep";
import DroverPersonalDataStep from "./registration-steps/DroverPersonalDataStep";
import DroverIdentificationStep from "./registration-steps/DroverIdentificationStep";
import DroverDocumentationStep from "./registration-steps/DroverDocumentationStep";
import RegistrationConfirmation from "./registration-steps/RegistrationConfirmation";
import ProgressIndicator from "./registration-steps/ProgressIndicator";

interface Props {
  onComplete: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
  defaultUserType?: UserType | string | null;
}

const NewRegistrationForm: React.FC<Props> = ({
  onComplete,
  isLoading = false,
  defaultUserType = null,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Prefijar el tipo de usuario si viene por URL (/registro/:userType)
  useEffect(() => {
    if (defaultUserType === "client" || defaultUserType === "drover") {
      setUserType(defaultUserType as UserType);
      setFormData({ userType: defaultUserType as UserType });
      setCurrentStep(1); // saltar selección de tipo
    }
  }, [defaultUserType]);

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

  // Auto-enviar al llegar al último paso (cliente y drover)
  useEffect(() => {
    const isOnLastStep = currentStep === totalSteps - 1;
    const isSupportedFlow = userType === "client" || userType === "drover";
    if (isSupportedFlow && isOnLastStep && !isSubmitting && isFormComplete()) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, userType]);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setFormData({ userType: type });
    setCurrentStep(1);
  };

  const handleStepData = React.useCallback(
    (stepData: Partial<RegistrationFormData>) => {
      setFormData((prev) => ({ ...prev, ...stepData }));
    },
    [] // <- sin dependencias => siempre la misma referencia
  );

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
    if (!formData.userType || !isFormComplete()) return;

    setIsSubmitting(true);

    try {
      console.log("Enviando datos de registro:", formData);

      // Preparar datos para el servicio de autenticación
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
          // Campos específicos para drover
          licenseFront: formData.licenseFront,
          licenseBack: formData.licenseBack,
          selfie: formData.profilePhoto,
          imageUpload2: formData.backgroundCheck,
          pdfUpload: formData.backgroundCheck,
          profileComplete: true,
        },
      };

      // Llamar al servicio de registro
      const response = await AuthService.signUp(registrationData);

      console.log("Respuesta del registro:", response);

      toast({
        title: "¡Registro exitoso!",
        description:
          "Tu cuenta ha sido creada correctamente. Te enviamos un correo para verificar tu cuenta.",
      });

      // Llamar al callback de finalización
      await onComplete(formData as RegistrationFormData);
    } catch (error: any) {
      console.error("Error en el registro:", error);

      toast({
        variant: "destructive",
        title: "Error en el registro",
        description:
          error?.message ||
          "No se pudo completar el registro. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
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

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return <UserTypeSelection onSelect={handleUserTypeSelect} />;
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
            />
          );
        case 3:
          return (
            <RegistrationConfirmation
              onConfirm={handleSubmit}
              isLoading={isSubmitting}
              data={formData}
              onPrevious={handlePrevious}
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
              isLoading={isSubmitting}
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      {userType && (
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={steps}
        />
      )}

      {/* Form Content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default NewRegistrationForm;
