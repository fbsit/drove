
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DriverApplicationData, driverStepSchemas } from '@/types/driver-application';
import { toast } from "@/hooks/use-toast";
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';

export const STEPS = {
  PERSONAL_INFO: 0,
  ADDRESS: 1,
  DOCUMENTATION: 2,
  CONFIRMATION: 3
} as const;

export type DriverApplicationStep = keyof typeof STEPS;

export const useDriverApplication = () => {
  const [step, setStep] = useState<number>(STEPS.PERSONAL_INFO);
  const { updateProfile } = useAuth();

  const form = useForm<DriverApplicationData>({
    defaultValues: {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      codigoPais: '+34',
      fechaNacimiento: undefined,
      pais: '',
      direccion: '',
      ciudad: '',
      region: '',
      codigoPostal: '',
      nifDniNie: '',
      licenciaConducirAnverso: '',
      licenciaConducirReverso: '',
      certificadoAntecedentes: '',
      aceptarTerminos: false,
    },
    mode: 'onSubmit'
  });

  const prefillForm = (values: Partial<DriverApplicationData>) => {
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.setValue(key as keyof DriverApplicationData, value);
      }
    });
  };

  const validateCurrentStep = async () => {
    try {
      const currentValues = form.getValues();
      console.log('⚡ Validando paso:', step);
      
      let fieldsToValidate: Record<string, any> = {};
      let fieldsToTrigger: (keyof DriverApplicationData)[] = [];
      
      switch (step) {
        case STEPS.PERSONAL_INFO:
          fieldsToValidate = {
            nombres: currentValues.nombres,
            apellidos: currentValues.apellidos,
            email: currentValues.email,
            telefono: currentValues.telefono,
            codigoPais: currentValues.codigoPais,
            fechaNacimiento: currentValues.fechaNacimiento,
          };
          fieldsToTrigger = ['nombres', 'apellidos', 'email', 'telefono', 'codigoPais', 'fechaNacimiento'];
          break;
        case STEPS.ADDRESS:
          fieldsToValidate = {
            pais: currentValues.pais,
            direccion: currentValues.direccion,
            ciudad: currentValues.ciudad,
            region: currentValues.region,
            codigoPostal: currentValues.codigoPostal,
          };
          fieldsToTrigger = ['pais', 'direccion', 'ciudad', 'region', 'codigoPostal'];
          break;
        case STEPS.DOCUMENTATION:
          fieldsToValidate = {
            nifDniNie: currentValues.nifDniNie,
            licenciaConducirAnverso: currentValues.licenciaConducirAnverso,
            licenciaConducirReverso: currentValues.licenciaConducirReverso,
            certificadoAntecedentes: currentValues.certificadoAntecedentes,
            aceptarTerminos: currentValues.aceptarTerminos,
          };
          fieldsToTrigger = ['nifDniNie', 'licenciaConducirAnverso', 'licenciaConducirReverso', 'certificadoAntecedentes', 'aceptarTerminos'];
          break;
        default:
          return false;
      }

      // Validar con react-hook-form
      const isFormValid = await form.trigger(fieldsToTrigger);
      
      if (!isFormValid) {
        return false;
      }

      // Validar con Zod
      let schemaForStep;
      switch (step) {
        case STEPS.PERSONAL_INFO:
          schemaForStep = driverStepSchemas.PERSONAL_INFO;
          break;
        case STEPS.ADDRESS:
          schemaForStep = driverStepSchemas.ADDRESS;
          break;
        case STEPS.DOCUMENTATION:
          schemaForStep = driverStepSchemas.DOCUMENTATION;
          break;
        default:
          return false;
      }

      try {
        await schemaForStep.parseAsync(fieldsToValidate);
        return true;
      } catch (error: any) {
        if (error.errors) {
          error.errors.forEach((err: any) => {
            const field = err.path[0] as keyof DriverApplicationData;
            form.setError(field, {
              type: 'manual',
              message: err.message,
            });
          });
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Error inesperado durante la validación:', error);
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al validar el formulario.",
        variant: "destructive",
      });
      return false;
    }
  };

  const onSubmit = async (data: DriverApplicationData, isCompletingProfile = false) => {
    try {
      const isValid = await validateCurrentStep();
      
      if (!isValid) {
        toast({
          title: "Error de validación",
          description: "Por favor, revisa los campos marcados en rojo.",
          variant: "destructive"
        });
        return;
      }

      if (isCompletingProfile) {
        // Update user profile data in the database
        await updateProfile({
          full_name: `${data.nombres} ${data.apellidos}`,
          // Update other fields as needed for profile completion
        });
      }

      if (step < STEPS.CONFIRMATION) {
        setStep(step + 1);
        form.clearErrors();
        toast({
          title: "Paso completado",
          description: "Continuando al siguiente paso.",
        });
      } else {
        toast({
          title: "Postulación Enviada",
          description: "Revisaremos tu postulación y te contactaremos si es necesario.",
        });
        console.log('📊 Datos finales:', data);
      }
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar el formulario.",
        variant: "destructive"
      });
    }
  };

  return {
    step,
    setStep,
    form,
    onSubmit,
    STEPS,
    prefillForm,
  };
};
