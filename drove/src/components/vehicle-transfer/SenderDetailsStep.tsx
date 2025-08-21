
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import DocumentDetailsForm from './DocumentDetailsForm';

interface SenderDetailsStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const SenderDetailsStep: React.FC<SenderDetailsStepProps> = ({ form }) => {
  return (
    <DocumentDetailsForm
      form={form}
      fieldPrefix="senderDetails"
      title="Datos de la persona que entrega el vehículo"
    />
  );
};

export default SenderDetailsStep;
