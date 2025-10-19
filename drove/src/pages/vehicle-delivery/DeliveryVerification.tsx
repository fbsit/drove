
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import DeliveryStepLayout from '@/components/vehicle-delivery/DeliveryStepLayout';
import DeliverySummaryStep from '@/components/vehicle-delivery/steps/DeliverySummaryStep';
import VehicleExteriorPhotosStep from '@/components/vehicle-delivery/steps/VehicleExteriorPhotosStep';
import VehicleInteriorPhotosStep from '@/components/vehicle-delivery/steps/VehicleInteriorPhotosStep';
import RecipientIdentityStep from '@/components/vehicle-delivery/steps/RecipientIdentityStep';
import FinalHandoverStep from '@/components/vehicle-delivery/steps/FinalHandoverStep';
import DeliveryConfirmationStep from '@/components/vehicle-delivery/steps/DeliveryConfirmationStep';
import { useDeliveryVerification } from '@/hooks/useDeliveryVerification';
import { VehicleTransferDB } from '@/types/vehicle-transfer-db';

// Adaptador simplificado para el componente (mapea nombres reales del backend)
const adaptTransferForDisplay = (raw: any): VehicleTransferDB => ({
  id: raw.id,
  created_at: raw.created_at || raw.createdAt || '',
  status: 'en_entrega',
  vehicleDetails: {
    type: 'coche',
    brand: raw.vehicleDetails?.brand || raw.brand || '',
    model: raw.vehicleDetails?.model || raw.model || '',
    year: raw.vehicleDetails?.year || raw.year || '',
    licensePlate: raw.vehicleDetails?.licensePlate || raw.licensePlate || '',
    vin: raw.vehicleDetails?.vin || raw.vin || '',
  },
  pickupDetails: {
    originAddress: raw.startAddress?.address || raw.startAddress?.city || raw.originAddress || '',
    destinationAddress: raw.endAddress?.address || raw.endAddress?.city || raw.destinationAddress || '',
    originLat: raw.startAddress?.lat || 0,
    originLng: raw.startAddress?.lng || 0,
    destinationLat: raw.endAddress?.lat || 0,
    destinationLng: raw.endAddress?.lng || 0,
    pickupDate: raw.travelDate || raw.pickupDate || '',
    pickupTime: raw.travelTime || raw.pickupTime || '',
  },
  senderDetails: {
    name: raw.personDelivery?.fullName || raw.senderDetails?.fullName || raw.senderName || '',
    fullName: raw.personDelivery?.fullName || raw.senderDetails?.fullName || raw.senderName || '',
    email: raw.personDelivery?.email || raw.senderDetails?.email || raw.senderEmail || '',
    phone: raw.personDelivery?.phone || raw.senderDetails?.phone || raw.senderPhone || '',
    dni: raw.personDelivery?.dni || raw.senderDetails?.dni || raw.senderDni || '',
  },
  receiverDetails: {
    name: raw.personReceive?.fullName || raw.receiverDetails?.fullName || raw.receiverName || '',
    fullName: raw.personReceive?.fullName || raw.receiverDetails?.fullName || raw.receiverName || '',
    email: raw.personReceive?.email || raw.receiverDetails?.email || raw.receiverEmail || '',
    phone: raw.personReceive?.phone || raw.receiverDetails?.phone || raw.receiverPhone || '',
    dni: raw.personReceive?.dni || raw.receiverDetails?.dni || raw.receiverDni || '',
  },
  transferDetails: {
    totalPrice: Number(raw.transferDetails?.totalPrice || raw.price || 0),
    distance: Number((raw as any)?.distanceTravel ? String((raw as any).distanceTravel).replace(/[^0-9.,-]/g, '').replace(',', '.') : (raw.transferDetails?.distance || raw.distance || 0)),
    duration: Number((raw as any)?.timeTravel ? String((raw as any).timeTravel).replace(/[^0-9.,-]/g, '').replace(',', '.') : (raw.transferDetails?.duration || raw.duration || 0)),
    signature: raw.transferDetails?.signature || '',
  },
  // Campos adicionales usados en el resumen
  // @ts-ignore
  distanceTravel: (raw as any)?.distanceTravel || '',
  // @ts-ignore
  timeTravel: (raw as any)?.timeTravel || '',
  // @ts-ignore
  routePolyline: (raw as any)?.routePolyline || '',
  paymentMethod: 'card',
});

const DeliveryVerification = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();

  const {
    transfer: rawTransfer,
    isLoading,
    error,
    currentStep,
    isNextDisabled,
    isProcessingStep,
    stepProgress,
    setIsNextDisabled,
    handleNextStep,
    handlePrevStep,
    handleSkipToStep,
    // valores actuales e inits
    exteriorPhotos,
    interiorPhotos,
    recipientIdentity,
    handoverDocuments,
    // setters persistentes
    setExteriorPhotos,
    setInteriorPhotos,
    setRecipientIdentity,
    setHandoverDocuments,
  } = useDeliveryVerification(transferId!);

  const transfer = rawTransfer ? adaptTransferForDisplay(rawTransfer) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-drove flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-[#6EF7FF] mx-auto" />
          <p className="mt-4 text-white text-lg">
            Cargando información del traslado…
          </p>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-drove flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Error al cargar el traslado'}
            </AlertDescription>
          </Alert>
          <button
            onClick={() => navigate('/drover/dashboard')}
            className="w-full bg-white text-drove font-medium py-2 rounded-lg"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'deliverySummary':
        return <DeliverySummaryStep transfer={transfer} />;

      case 'exteriorPhotos':
        return (
          <VehicleExteriorPhotosStep
            transferId={transferId!}
            onImagesReady={setExteriorPhotos}
            onImagesChanged={setIsNextDisabled}
            initialImages={exteriorPhotos as any}
          />
        );

      case 'interiorPhotos':
        return (
          <VehicleInteriorPhotosStep
            transferId={transferId!}
            onImagesReady={setInteriorPhotos}
            onImagesChanged={setIsNextDisabled}
            initialImages={interiorPhotos as any}
          />
        );

      case 'recipientIdentity':
        return (
          <RecipientIdentityStep
            transferId={transferId!}
            onDataReady={setRecipientIdentity}
            onDataChanged={setIsNextDisabled}
            initialData={recipientIdentity as any}
          />
        );

      case 'finalHandover':
        return (
          <FinalHandoverStep
            transferId={transferId!}
            onDataReady={setHandoverDocuments}
            onDataChanged={setIsNextDisabled}
            initialData={handoverDocuments as any}
          />
        );

      case 'confirmation':
        return <DeliveryConfirmationStep transfer={transfer} />;

      default:
        return <div>Paso no implementado</div>;
    }
  };

  return (
    <DeliveryStepLayout
      currentStep={currentStep}
      transferId={transferId!}
      stepProgress={stepProgress}
      isLoading={isProcessingStep}
      onNextStep={handleNextStep}
      onPrevStep={currentStep !== 'deliverySummary' ? handlePrevStep : undefined}
      onSkipToStep={handleSkipToStep}
      isFinalStep={currentStep === 'confirmation'}
      isNextDisabled={currentStep !== 'deliverySummary' && isNextDisabled}
    >
      {renderCurrentStep()}
    </DeliveryStepLayout>
  );
};

export default DeliveryVerification;
