
// src/hooks/useDeliveryVerification.ts
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DeliveryStepKey,
  VehicleTransferDB,
} from '@/types/vehicle-transfer-db';
import {
  getVehicleTransfer,
  saveDeliveryVerification,
} from '@/services/vehicleTransferService';
import TransferService from '@/services/transferService';
import { TransferStatus } from '@/services/api/types/transfers';

// Definición de interfaz local para TransferDetail
interface LocalTransferDetail {
  id: string;
  created_at?: string;
  createdAt?: string;
  typeVehicle?: string;
  brandVehicle?: string;
  modelVehicle?: string;
  yearVehicle?: string;
  patentVehicle?: string;
  bastidor?: string;
  startAddress?: {city: string; lat: number; lng: number};
  endAddress?: {city: string; lat: number; lng: number};
  travelDate?: string;
  travelTime?: string;
  personDelivery?: {fullName: string; dni: string; email: string; phone: string};
  personReceive?: {fullName: string; dni: string; email: string; phone: string};
  distanceTravel?: string | number;
  timeTravel?: string | number;
  totalPrice?: string | number;
  signatureStartClient?: string;
  paymentMethod?: string;
  status: string;
}

/**
 * Hook que gestiona todo el flujo de verificación de **entrega**.
 * Devuelve el traslado, el paso actual, funciones de navegación y setters
 * que cada sub‑paso usa para inyectar sus datos.
 */
export const useDeliveryVerification = (transferId: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ---------- estado global ---------- */
  const [transfer, setTransfer] = useState<VehicleTransferDB | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [currentStep, setCurrentStep] =
    useState<DeliveryStepKey>('deliverySummary');
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isProcessingStep, setIsProcessingStep] = useState(false);

  /* ---------- datos de verificación con URLs de imágenes ---------- */
  const [exteriorPhotos, setExteriorPhotos] = useState<Record<string, string>|null>(null);
  const [interiorPhotos, setInteriorPhotos] = useState<Record<string, string>|null>(null);
  const [recipientIdentity, setRecipientIdentity] = useState<{
    idNumber: string;
    idFrontPhoto: string;
    idBackPhoto: string;
    selfieWithId: string;
    hasDamage: boolean;
    damageDescription?: string;
  }|null>(null);
  const [handoverDocuments, setHandoverDocuments] = useState<{
    delivery_document: string;
    fuel_receipt: string;
    comments?: string;
    drover_signature: string;
    client_signature: string;
  }|null>(null);

  /* ---------- progreso visual ---------- */
  const [stepProgress, setStepProgress] = useState<Record<DeliveryStepKey, boolean>>({
    'deliverySummary': false,
    'exteriorPhotos': false,
    'interiorPhotos': false,
    'recipientIdentity': false,
    'finalHandover': false,
    'confirmation': false,
  });

  /* ---------- carga inicial ---------- */
  useEffect(() => {
    (async () => {
      if (!transferId) {
        setError('ID de traslado no indicado');
        setIsLoading(false);
        return;
      }
      try {
        let data = await getVehicleTransfer(transferId) as unknown as LocalTransferDetail;
        // Fallback: si no vienen relaciones clave, re-fetch directo al travel completo
        const lacksCore = !data?.startAddress || !data?.endAddress || (data as any)?.routePolyline == null;
        if (lacksCore) {
          try {
            const full = await TransferService.getTravelById(transferId);
            data = { ...(full as any) } as LocalTransferDetail;
          } catch {}
        }
        if (!data) throw new Error('Traslado no encontrado');

        const parseNum = (v: any): number => {
          if (typeof v === 'number' && isFinite(v)) return v;
          const s = String(v ?? '').replace(/[^0-9.,-]/g, '').replace(',', '.');
          const n = parseFloat(s);
          return isFinite(n) ? n : 0;
        };

        const adapted: VehicleTransferDB = {
          id: data.id,
          created_at: data.created_at ?? data.createdAt ?? '',
          // Mapear compensación si viene del backend
          driverFee: (data as any)?.driverFee ?? undefined,
          driverFeeMeta: (data as any)?.driverFeeMeta ?? undefined,
          vehicleDetails: {
            type: mapVehicleType(data.typeVehicle) ?? 'coche',
            brand: data.brandVehicle ?? '',
            model: data.modelVehicle ?? '',
            year: data.yearVehicle ?? '',
            licensePlate: data.patentVehicle ?? '',
            vin: data.bastidor ?? '',
          },
          pickupDetails: {
            originAddress: data.startAddress?.city ?? (data as any)?.startAddress?.address ?? '',
            destinationAddress: data.endAddress?.city ?? (data as any)?.endAddress?.address ?? '',
            originLat: data.startAddress?.lat ?? (data as any)?.startAddress?.lat ?? 0,
            originLng: data.startAddress?.lng ?? (data as any)?.startAddress?.lng ?? 0,
            destinationLat: data.endAddress?.lat ?? (data as any)?.endAddress?.lat ?? 0,
            destinationLng: data.endAddress?.lng ?? (data as any)?.endAddress?.lng ?? 0,
            pickupDate: data.travelDate ?? '',
            pickupTime: data.travelTime ?? '',
          },
          senderDetails: {
            name: data.personDelivery?.fullName ?? '',
            fullName: data.personDelivery?.fullName ?? '',
            dni: data.personDelivery?.dni ?? '',
            email: data.personDelivery?.email ?? '',
            phone: data.personDelivery?.phone ?? '',
          },
          receiverDetails: {
            name: data.personReceive?.fullName ?? '',
            fullName: data.personReceive?.fullName ?? '',
            dni: data.personReceive?.dni ?? '',
            email: data.personReceive?.email ?? '',
            phone: data.personReceive?.phone ?? '',
          },
          transferDetails: {
            distance: parseNum((data as any)?.distanceTravel ?? (data as any)?.transfer_details?.distance ?? (data as any)?.distance ?? 0),
            duration: parseNum((data as any)?.timeTravel ?? (data as any)?.transfer_details?.duration ?? (data as any)?.duration ?? 0),
            totalPrice: Number(data.totalPrice ?? '0'),
            signature: data.signatureStartClient ?? '',
          },
          paymentMethod: mapPaymentMethod(data.paymentMethod),
          status: mapApiStatusToAppStatus(data.status),
        };

        setTransfer(adapted);

        if (adapted.status === 'completado') {
          setError('Este vehículo ya fue entregado');
        } else if (adapted.status !== 'en_entrega') {
          setError('Este traslado no está en estado de entrega');
        } else {
          setStepProgress((p) => ({ ...p, 'deliverySummary': true }));
        }

        // Rehidratar progreso y datos desde localStorage
        try {
          const ext = localStorage.getItem(`delivery:${transferId}:exterior`);
          const inte = localStorage.getItem(`delivery:${transferId}:interior`);
          const recip = localStorage.getItem(`delivery:${transferId}:recipient`);
          const hand = localStorage.getItem(`delivery:${transferId}:handover`);

          if (ext) {
            const parsed = JSON.parse(ext);
            if (parsed && typeof parsed === 'object') setExteriorPhotos(parsed);
          }
          if (inte) {
            const parsed = JSON.parse(inte);
            if (parsed && typeof parsed === 'object') setInteriorPhotos(parsed);
          }
          if (recip) {
            const parsed = JSON.parse(recip);
            if (parsed && typeof parsed === 'object') setRecipientIdentity(parsed);
          }
          if (hand) {
            const parsed = JSON.parse(hand);
            if (parsed && typeof parsed === 'object') setHandoverDocuments(parsed);
          }

          setStepProgress((p) => ({
            ...p,
            exteriorPhotos: Boolean(ext),
            interiorPhotos: Boolean(inte),
            recipientIdentity: Boolean(recip),
            finalHandover: Boolean(hand),
          }));
        } catch {}
      } catch (e: any) {
        setError(e.message ?? 'Error al cargar datos del traslado');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [transferId]);

  /* ---------- helpers ---------- */
  function mapVehicleType(
    type?: string
  ): "coche" | "camioneta" {
    if (!type) return "coche";
    const t = type.toLowerCase();
    if (t === "camioneta" || t === "camión" || t === "truck" || t === "van") return "camioneta";
    return "coche";
  }
  
  function mapPaymentMethod(
    method?: string
  ): "card" | "transfer" {
    if (!method) return "card";
    const m = method.toLowerCase();
    if (m === "transfer" || m === "transferencia" || m === "bank") return "transfer";
    return "card";
  }
  
  function mapApiStatusToAppStatus(
    apiStatus: TransferStatus | string,
  ): VehicleTransferDB['status'] {
    switch (apiStatus) {
      case TransferStatus.CREATED:   return 'pendiente';
      case TransferStatus.ASSIGNED:  return 'confirmado';
      case TransferStatus.PICKED_UP: return 'en_entrega';
      case TransferStatus.DELIVERED: return 'completado';
      case TransferStatus.CANCELLED: return 'cancelado';
      default:                       return 'en_entrega';
    }
  }

  /* ---------- navegación ---------- */
  const stepOrder: DeliveryStepKey[] = [
    'deliverySummary',
    'exteriorPhotos',
    'interiorPhotos',
    'recipientIdentity',
    'finalHandover',
    'confirmation',
  ];

  const handleNextStep = useCallback(async () => {
    if (!transfer) return;
    const idx = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[idx + 1] ?? null;

    // ─── Último paso: enviamos verificación ─────────────────
    if (currentStep === 'finalHandover' && nextStep === 'confirmation') {
      setIsProcessingStep(true);

      // Validamos que existan todos los bloques
      const missingBlock =
        !exteriorPhotos      ? 'fotos exteriores'   :
        !interiorPhotos      ? 'fotos interiores'   :
        !recipientIdentity   ? 'identidad receptor' :
        !handoverDocuments   ? 'documentos entrega' : '';

      if (missingBlock) {
        toast({
          title: 'Faltan datos',
          description: `Completa ${missingBlock} antes de continuar`,
          variant: 'destructive',
        });
        setIsProcessingStep(false);
        return;
      }

      try {
        // Estructurar datos según DeliveryVerificationDto
        const deliveryData = {
          exteriorPhotos: {
            frontView: exteriorPhotos.frontView || '',
            rearView: exteriorPhotos.rearView || '',
            leftFront: exteriorPhotos.leftFront || '',
            leftRear: exteriorPhotos.leftRear || '',
            rightFront: exteriorPhotos.rightFront || '',
            rightRear: exteriorPhotos.rightRear || ''
          },
          interiorPhotos: {
            dashboard: interiorPhotos.dashboard || '',
            driverSeat: interiorPhotos.driverSeat || '',
            passengerSeat: interiorPhotos.passengerSeat || '',
            rearLeftSeat: interiorPhotos.rearLeftSeat || '',
            rearRightSeat: interiorPhotos.rearRightSeat || '',
            trunk: interiorPhotos.trunk || ''
          },
          recipientIdentity: {
            idNumber: recipientIdentity.idNumber,
            idFrontPhoto: recipientIdentity.idFrontPhoto,
            idBackPhoto: recipientIdentity.idBackPhoto,
            selfieWithId: recipientIdentity.selfieWithId,
            hasDamage: recipientIdentity.hasDamage,
            damageDescription: recipientIdentity.damageDescription
          },
          handoverDocuments: {
            delivery_document: handoverDocuments.delivery_document,
            fuel_receipt: handoverDocuments.fuel_receipt,
            drover_signature: handoverDocuments.drover_signature,
            client_signature: handoverDocuments.client_signature,
            comments: handoverDocuments.comments
          },
          deliveredAt: new Date().toISOString()
        };

        console.log('Enviando datos de verificación de entrega estructurados:', deliveryData);
        
        const ok = await saveDeliveryVerification(transferId, deliveryData);
        if (!ok) throw new Error('Error al guardar verificación');
        
        toast({ title: 'Entrega confirmada', description: 'Datos guardados correctamente' });

        setStepProgress((p) => ({ ...p, [currentStep]: true }));
        setCurrentStep('confirmation');
        setStepProgress((p) => ({ ...p, confirmation: true }));
      } catch (err: any) {
        console.error('Error en verificación de entrega:', err);
        toast({
          title: 'Error',
          description: err.message || 'No se pudo guardar la verificación',
          variant: 'destructive',
        });
      } finally {
        setIsProcessingStep(false);
      }
      return;
    }

    // ─── Pasos intermedios ─────────────────────────────────
    if (nextStep) {
      setStepProgress((p) => ({ ...p, [currentStep]: true }));
      setCurrentStep(nextStep);
    }
  }, [
    currentStep,
    exteriorPhotos,
    interiorPhotos,
    recipientIdentity,
    handoverDocuments,
    transfer,
    transferId,
    toast,
    stepOrder
  ]);

  const handlePrevStep = useCallback(() => {
    const idx = stepOrder.indexOf(currentStep);
    const prev = stepOrder[idx - 1] ?? 'deliverySummary';
    setCurrentStep(prev);
  }, [currentStep, stepOrder]);

  const handleSkipToStep = useCallback(
    (step: DeliveryStepKey) => {
      if (stepProgress[step]) setCurrentStep(step);
    },
    [stepProgress],
  );

  /* ---------- setters con persistencia ---------- */
  const saveExteriorPhotos = useCallback((photos: Record<string, string>) => {
    setExteriorPhotos(photos);
    try { localStorage.setItem(`delivery:${transferId}:exterior`, JSON.stringify(photos)); } catch {}
    setStepProgress((p) => ({ ...p, exteriorPhotos: true }));
  }, [transferId]);

  const saveInteriorPhotos = useCallback((photos: Record<string, string>) => {
    setInteriorPhotos(photos);
    try { localStorage.setItem(`delivery:${transferId}:interior`, JSON.stringify(photos)); } catch {}
    setStepProgress((p) => ({ ...p, interiorPhotos: true }));
  }, [transferId]);

  const saveRecipientIdentity = useCallback((data: {
    idNumber: string;
    idFrontPhoto: string;
    idBackPhoto: string;
    selfieWithId: string;
    hasDamage: boolean;
    damageDescription?: string;
  }) => {
    setRecipientIdentity(data);
    try { localStorage.setItem(`delivery:${transferId}:recipient`, JSON.stringify(data)); } catch {}
    setStepProgress((p) => ({ ...p, recipientIdentity: true }));
  }, [transferId]);

  const saveHandoverDocuments = useCallback((data: {
    delivery_document: string;
    fuel_receipt: string;
    comments?: string;
    drover_signature: string;
    client_signature: string;
  }) => {
    setHandoverDocuments(data);
    try { localStorage.setItem(`delivery:${transferId}:handover`, JSON.stringify(data)); } catch {}
    setStepProgress((p) => ({ ...p, finalHandover: true }));
  }, [transferId]);

  /* ---------- API ---------- */
  return {
    transfer,
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
    // valores actuales para hidratar pasos
    exteriorPhotos,
    interiorPhotos,
    recipientIdentity,
    handoverDocuments,
    // setters con persistencia
    setExteriorPhotos: saveExteriorPhotos,
    setInteriorPhotos: saveInteriorPhotos,
    setRecipientIdentity: saveRecipientIdentity,
    setHandoverDocuments: saveHandoverDocuments,
  };
};
