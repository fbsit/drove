
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';
import TransferDetailsStep from '../TransferDetailsStep';

interface MobileTransferDetailsStepProps {
  form: UseFormReturn<VehicleTransferFormData>;
  onNext: () => void;
  onPrev: () => void;
}

const MobileTransferDetailsStep: React.FC<MobileTransferDetailsStepProps> = (props) => {
  return <TransferDetailsStep {...props} />;
};

export default MobileTransferDetailsStep;
