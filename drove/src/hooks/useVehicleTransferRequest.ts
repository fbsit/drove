import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { VehicleTransferService } from "@/services/vehicleTransferService";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";

export const useVehicleTransferRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<VehicleTransferRequest>({
    defaultValues: {
      pickupAddress: "",
      pickupAddressLat: null,
      pickupAddressLng: null,
      destinationAddress: "",
      destinationAddressLat: null,
      destinationAddressLng: null,
      transferDate: null,
      transferTime: "",
      vehicleType: "",
      name: "",
      email: "",
      phone: "",
      comments: "",
      price: 0,
      paymentMethod: "card",
      cardToken: "",
      saveCard: false,
      vehicleDetails: {
        type: "",
        brand: "",
        model: "",
        year: "",
        licensePlate: "",
        vin: "",
      },
      transferDetails: {
        totalPrice: 0,
        distance: 0,
        duration: 0,
        signature: "",
      },
      senderDetails: {
        fullName: "",
        dni: "",
        email: "",
        phone: "",
      },
      receiverDetails: {
        fullName: "",
        dni: "",
        email: "",
        phone: "",
      },
      pickupDetails: {
        originAddress: {
          address: "",
          city: "",
          lat: 0,
          lng: 0,
        },
        destinationAddress: {
          address: "",
          city: "",
          lat: 0,
          lng: 0,
        },
        pickupDate: undefined,
        pickupTime: "",
      },
    },
  });

  const resetForm = () => {
    setIsSubmitted(false);
    setStep(1);
    form.reset();
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const validateStep = (stepNumber: number): boolean => {
    const formValues = form.getValues();

    if (stepNumber === 1) {
      const { vehicleDetails } = formValues ?? {};
      const hasAllVehicleFields =
        !!vehicleDetails?.brand?.trim() &&
        !!vehicleDetails?.model?.trim() &&
        !!vehicleDetails?.year?.trim() &&
        !!vehicleDetails?.vin?.trim() &&
        !!vehicleDetails?.licensePlate?.trim();

      if (!hasAllVehicleFields) {
        if (!vehicleDetails?.licensePlate?.trim()) {
          form.setError("vehicleDetails.licensePlate" as any, {
            type: "required",
            message: "La matrícula es obligatoria",
          });
        }
        if (!vehicleDetails?.vin?.trim()) {
          form.setError("vehicleDetails.vin" as any, {
            type: "required",
            message: "El VIN es obligatorio",
          });
        }
        return false;
      }
    }

    if (stepNumber === 2) {
      const { pickupDetails } = formValues ?? {};
      const isValidAddress = (addr?: {
        address?: string;
        city?: string;
        lat?: number;
        lng?: number;
      }) =>
        !!addr?.address?.trim() &&
        !!addr?.city?.trim() &&
        typeof addr.lat === "number" &&
        typeof addr.lng === "number" &&
        addr.lat !== 0 &&
        addr.lng !== 0;

      const hasAllPickupFields =
        isValidAddress(pickupDetails?.originAddress) &&
        isValidAddress(pickupDetails?.destinationAddress) &&
        !!pickupDetails?.pickupDate &&
        !!pickupDetails?.pickupTime;

      if (!hasAllPickupFields) return false;
    }

    return true;
  };

  const updateForm = (data: Partial<VehicleTransferRequest>) => {
    console.log("[TRANSFER_REQUEST] 🔄 Updating form data:", data);
    Object.entries(data).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  };

  function toCreateTransferPayload(
    data: VehicleTransferRequest
  ): any /* o mejor: CreateTransferRequest si lo definís */ {
    return {
      ...data,
      status: "pending",
      vehicleDetails: {
        type: data.vehicleDetails?.type || "",
        brand: data.vehicleDetails?.brand || "",
        model: data.vehicleDetails?.model || "",
        year: data.vehicleDetails?.year || "",
        licensePlate: data.vehicleDetails?.licensePlate || "",
        vin: data.vehicleDetails?.vin || "",
      },
      pickupDetails: {
        originAddress: {
          city: data.pickupDetails?.originAddress?.city || "",
          lat: data.pickupDetails?.originAddress?.lat || 0,
          lng: data.pickupDetails?.originAddress?.lng || 0,
          address: data.pickupDetails?.originAddress?.address || "",
        },
        destinationAddress: {
          city: data.pickupDetails?.destinationAddress?.city || "",
          lat: data.pickupDetails?.destinationAddress?.lat || 0,
          lng: data.pickupDetails?.destinationAddress?.lng || 0,
          address: data.pickupDetails?.destinationAddress?.address || "",
        },
        pickupDate: data.pickupDetails?.pickupDate
          ? data.pickupDetails.pickupDate.toISOString().split("T")[0] // 👈 string YYYY-MM-DD
          : "",
        pickupTime: data.pickupDetails?.pickupTime || "",
      },
    };
  }

  const submitTransferRequest = async (data: VehicleTransferRequest) => {
    try {
      setIsLoading(true);

      const payload = toCreateTransferPayload(data);

      const response = await VehicleTransferService.createTransfer(payload);

      toast({
        title: "Solicitud enviada",
        description:
          "Tu solicitud de traslado ha sido enviada correctamente. Te contactaremos pronto.",
      });

      setIsSubmitted(true);
      return { success: true, data: response };
    } catch (error: any) {
      console.error("[TRANSFER_REQUEST] ❌ Error:", error);

      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.message ||
          "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
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
    updateForm,
  };
};
