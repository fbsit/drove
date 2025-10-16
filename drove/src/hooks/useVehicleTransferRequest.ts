
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { VehicleTransferService } from '@/services/vehicleTransferService';

export interface VehicleTransferFormData {
  paymentMethod?: 'card' | 'transfer' | 'cash';
  vehicleDetails?: {
    type?: 'coche' | 'camioneta';
    licensePlate?: string;
    vin?: string;
    brand?: string;
    model?: string;
    year?: string;
  };
  pickupDetails?: {
    originAddress?: {
      address: string;
      city: string;
      lat: number;
      lng: number;
    };
    destinationAddress?: {
      address: string;
      city: string;
      lat: number;
      lng: number;
    };
    pickupDate?: Date;
    pickupTime?: string;
  };
  senderDetails?: {
    name?: string;
    phone?: string;
    email?: string;
    dni?: string;
  };
  receiverDetails?: {
    name?: string;
    phone?: string;
    email?: string;
    dni?: string;
  };
  transferDetails?: {
    distance?: number;
    duration?: number;
    totalPrice?: number;
    signature?: string;
  };
}

export interface VehicleTransferData {
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licensePlate?: string;
  vin?: string;
  originAddress?: string;
  destinationAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  senderDni?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  receiverDni?: string;
  paymentMethod?: 'card' | 'transfer' | 'cash';
  distance?: number;
  duration?: number;
  totalPrice?: number;
  signature?: string;
}

export const useVehicleTransferRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<VehicleTransferFormData>({
    defaultValues: {
      paymentMethod: 'card',
      vehicleDetails: {},
      pickupDetails: {},
      senderDetails: {},
      receiverDetails: {},
      transferDetails: {},
    }
  });

  const submitTransferRequest = async (data: VehicleTransferData) => {
    try {
      setIsLoading(true);

      console.log('[TRANSFER_REQUEST] 🔄 Enviando solicitud de transferencia:', data);

      const response = await VehicleTransferService.createTransfer(data as any);

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de traslado ha sido enviada correctamente. Te contactaremos pronto.",
      });

      setIsSubmitted(true);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('[TRANSFER_REQUEST] ❌ Error al enviar solicitud:', error);

      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setStep(1);
    form.reset();
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const validateStep = (stepNumber: number): boolean => {
    console.log("paso a validar", stepNumber);
    const formValues = form.getValues();
    console.log("formValues", formValues)
    if (stepNumber === 1) {
      const { vehicleDetails } = formValues ?? {};

      const hasAllVehicleFields =
        !!vehicleDetails?.brand?.trim() &&
        !!vehicleDetails?.model?.trim() &&
        !!vehicleDetails?.year?.toString().trim() &&
        !!vehicleDetails?.vin?.trim(); // matrícula ya no es obligatoria

      if (!hasAllVehicleFields) {
        if (!vehicleDetails?.vin?.trim()) {
          form.setError('vehicleDetails.vin' as any, { type: 'required', message: 'El VIN es obligatorio' });
        }
        return false;
      }

      // Validaciones estrictas
      // Validar matrícula solo si el usuario la introduce
      if (vehicleDetails.licensePlate && vehicleDetails.licensePlate.trim().length > 0) {
        const licenseSanitized = (vehicleDetails.licensePlate || '')
          .toUpperCase()
          .replace(/\s|-/g, '');
        const licenseRegex = /^(?:[0-9]{4}[A-Z]{3}|[A-Z]{3}[0-9]{4})$/; // 1234ABC o ABC1234
        if (!licenseRegex.test(licenseSanitized)) {
          form.setError('vehicleDetails.licensePlate' as any, {
            type: 'validate',
            message: 'Matrícula inválida. Formato 1234ABC o ABC1234',
          });
          toast({ variant: 'destructive', title: 'Matrícula inválida', description: 'Usa el formato 1234ABC o ABC1234.' });
          return false;
        }
      }

      const vinSanitized = (vehicleDetails.vin || '')
        .toUpperCase()
        .replace(/\s|-/g, '');
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/; // sin I,O,Q
      if (!vinRegex.test(vinSanitized)) {
        form.setError('vehicleDetails.vin' as any, {
          type: 'validate',
          message: 'VIN inválido. Debe tener 17 caracteres (sin I, O, Q)',
        });
        toast({ variant: 'destructive', title: 'VIN inválido', description: 'Debe tener 17 caracteres alfanuméricos (sin I, O, Q).' });
        return false;
      }
    }
    if (stepNumber === 2) {
      const { pickupDetails } = formValues ?? {};

      const isValidAddress = (addr?: {
        address?: string;
        lat?: number;
        lng?: number;
      }) =>
        !!addr?.address?.trim() &&
        typeof addr.lat === "number" &&
        typeof addr.lng === "number" &&
        addr.lat !== 0 &&
        addr.lng !== 0;

      const hasAllPickupFields =
        isValidAddress(pickupDetails?.originAddress) &&
        isValidAddress(pickupDetails?.destinationAddress) &&
        !!pickupDetails?.originAddress?.city?.trim() &&
        !!pickupDetails?.destinationAddress?.city?.trim() &&
        !!pickupDetails?.pickupDate &&
        !!pickupDetails?.pickupTime;

      if (!hasAllPickupFields) {
        return false;
      }

      // Regla: permitir fechas futuras; nunca permitir fechas/horas pasadas
      try {
        // Construye fecha local segura para evitar desajustes por zona horaria/UTC
        const rawDate: any = pickupDetails.pickupDate as any;
        const dateStr = typeof rawDate === 'string' ? rawDate : new Date(rawDate).toISOString().slice(0, 10);
        const [year, month, day] = dateStr.split('-').map((v: string) => Number(v));
        const [h = '00', m = '00'] = String(pickupDetails.pickupTime || '00:00').split(':');
        const dateVal = new Date(year, (month || 1) - 1, day || 1, Number(h), Number(m), 0, 0);

        const now = new Date();
        
        // Fecha pasada (día anterior) o misma fecha con hora pasada
        if (dateVal.getTime() < now.getTime()) {
          toast({
            variant: 'destructive',
            title: 'Fecha inválida',
            description: 'Selecciona una fecha y hora futura.',
          });
          form.setError('pickupDetails.pickupDate' as any, { type: 'validate', message: 'No se permiten fechas pasadas' });
          return false;
        }
        
        // Anteriormente se exigían 4 horas de anticipación.
        // Dejamos comentada la validación para poder restaurarla cuando se requiera nuevamente.
        // const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        // const isSameDay =
        //   dateVal.getFullYear() === now.getFullYear() &&
        //   dateVal.getMonth() === now.getMonth() &&
        //   dateVal.getDate() === now.getDate();
        // if (isSameDay && dateVal < fourHoursLater) {
        //   toast({
        //     variant: 'destructive',
        //     title: 'Anticipación insuficiente',
        //     description: 'Debes solicitar con al menos 4 horas de anticipación.',
        //   });
        //   form.setError('pickupDetails.pickupTime' as any, { type: 'validate', message: 'Mínimo 4 horas desde ahora' });
        //   return false;
        // }
      } catch {}
    }
    return true;
  };

  const updateForm = (data: Partial<VehicleTransferData>) => {
    console.log('[TRANSFER_REQUEST] 🔄 Updating form data:', data);
  };

  return {
    submitTransferRequest,
    isLoading,
    isSubmitted,
    resetForm,
    step,
    form,
    nextStep,
    prevStep,
    validateStep,
    updateForm
  };
};
