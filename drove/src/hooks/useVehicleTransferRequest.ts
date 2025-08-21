
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
        !!vehicleDetails?.vin?.trim() &&
        !!vehicleDetails?.licensePlate?.trim();

      if (!hasAllVehicleFields) {
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
        !!pickupDetails?.pickupDate &&
        !!pickupDetails?.pickupTime;

      if (!hasAllPickupFields) {
        return false;
      }
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
