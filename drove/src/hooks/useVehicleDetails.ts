
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";

export const useVehicleDetails = (form: UseFormReturn<VehicleTransferRequest>) => {
  const selectedType = form.watch("vehicleDetails.type") || "coche";
  
  return {
    selectedType: selectedType || "coche"
  };
};
