
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import DocumentDetailsForm from './DocumentDetailsForm';

interface ReceiverDetailsStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const ReceiverDetailsStep: React.FC<ReceiverDetailsStepProps> = ({ form }) => {
  return (
    <DocumentDetailsForm
      form={form}
      fieldPrefix="receiverDetails"
      title="Datos de la persona que recibe el vehículo"
    />
  );
};

export default ReceiverDetailsStep;
