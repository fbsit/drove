
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import PaymentMethodStep from '@/components/vehicle-transfer/PaymentMethodStep';

interface MobilePaymentMethodStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const MobilePaymentMethodStep: React.FC<MobilePaymentMethodStepProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <PaymentMethodStep form={form} />
    </div>
  );
};

export default MobilePaymentMethodStep;
