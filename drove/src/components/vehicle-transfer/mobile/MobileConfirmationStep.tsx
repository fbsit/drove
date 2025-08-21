
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import ConfirmationStep from '@/components/vehicle-transfer/ConfirmationStep';

interface MobileConfirmationStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const MobileConfirmationStep: React.FC<MobileConfirmationStepProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <ConfirmationStep form={form} />
    </div>
  );
};

export default MobileConfirmationStep;
