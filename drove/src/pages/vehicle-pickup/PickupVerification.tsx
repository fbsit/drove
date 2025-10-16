/* pages/PickupVerification.tsx
   – Sube imágenes inmediatamente con StorageService usando solo folderPath
   – Envía datos estructurados según PickupVerificationDto
*/
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check, ArrowLeft, ArrowRight, Camera, FileText, User, Loader, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TransferService } from '@/services/transferService';
import { usePickupVerification } from '@/hooks/usePickupVerification';
import { StorageService } from '@/services/storageService';
import SignatureCanvas from '@/components/SignatureCanvas';

// Utilidad: comprimir imagen en el cliente antes de subir (reduce 70-85%)
async function compressImage(file: File, maxWidth = 1600, quality = 0.75): Promise<File> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
    const scale = Math.min(1, maxWidth / (img.width || maxWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((img.width || maxWidth) * scale));
    canvas.height = Math.max(1, Math.round((img.height || maxWidth) * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
    );
    URL.revokeObjectURL(img.src);
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.(png|jpg|jpeg)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

const STEPS = {
  VEHICLE_EXTERIOR: 1,
  VEHICLE_INTERIOR: 2,
  SIGNATURE_COMMENTS: 3,
  CONFIRMATION: 4,
  SUMMARY: 5,
} as const;

const STEP_NAMES = {
  [STEPS.VEHICLE_EXTERIOR]: 'Fotos Exterior',
  [STEPS.VEHICLE_INTERIOR]: 'Fotos Interior',
  [STEPS.SIGNATURE_COMMENTS]: 'Firma y Comentarios',
  [STEPS.CONFIRMATION]: 'Confirmación',
  [STEPS.SUMMARY]: 'Resumen',
};

// Mapeo de claves para exterior según ExteriorPhotosDto
const EXTERIOR_KEYS = {
  frontal: 'frontView',
  trasera: 'rearView',
  lateral_izq_front: 'leftFront',
  lateral_izq_rear: 'leftRear',
  lateral_der_front: 'rightFront',
  lateral_der_rear: 'rightRear'
} as const;

// Mapeo de claves para interior según InteriorPhotosDto
const INTERIOR_KEYS = {
  tablero: 'dashboard',
  asiento_conductor: 'driverSeat',
  asiento_pasajero: 'passengerSeat',
  asiento_trasero_izq: 'rearLeftSeat',
  asiento_trasero_der: 'rearRightSeat',
  maletero: 'trunk'
} as const;

const PickupVerification: React.FC = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(STEPS.VEHICLE_EXTERIOR);
  const [transfer, setTransfer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Loading por campo (permite subidas en paralelo)
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [accessWarning, setAccessWarning] = useState<string | null>(null);
  const [accessBlocked, setAccessBlocked] = useState<boolean>(false);

  // Construye una Date en hora local a partir de "YYYY-MM-DD" + "HH:mm",
  // evitando interpretaciones en UTC que pueden restar un día según la zona.
  const buildLocalDateTime = (dateStr?: string, timeStr?: string): Date | null => {
    if (!dateStr) return null;
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
    const time = String(timeStr || '00:00');
    const [hh = '00', mm = '00'] = time.split(':');
    const hour = Number(hh);
    const minute = Number(mm);
    const m = dateOnly.exec(String(dateStr));
    if (m) {
      const year = Number(m[1]);
      const monthIndex = Number(m[2]) - 1;
      const day = Number(m[3]);
      return new Date(year, monthIndex, day, hour, minute, 0, 0);
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      d.setHours(hour, minute, 0, 0);
      return d;
    }
    return null;
  };

  const scheduledPickupText = React.useMemo(() => {
    try {
      const dateStr = (transfer as any)?.travelDate || (transfer as any)?.pickupDetails?.pickupDate;
      const timeStr = (transfer as any)?.travelTime || (transfer as any)?.pickupDetails?.pickupTime;
      const dt = buildLocalDateTime(dateStr, timeStr);
      if (!dt) return '';
      return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(dt);
    } catch {
      return '';
    }
  }, [transfer]);

  const {
    signature,
    comments,
    setSignature,
    setComments,
    submitVerification,
    isLoading: isSubmitting,
    clearDraft,
  } = usePickupVerification(transferId!);
  const [droverSignature, setDroverSignature] = useState<string>('');

  // URLs de las imágenes subidas estructuradas según DTOs
  const [exteriorImageUrls, setExteriorImageUrls] = useState<Record<string, string>>({});
  const [interiorImageUrls, setInteriorImageUrls] = useState<Record<string, string>>({});

  // Hidratar imágenes desde localStorage por traslado
  useEffect(() => {
    if (!transferId) return;
    try {
      const ext = localStorage.getItem(`pickup:${transferId}:exterior`);
      const inte = localStorage.getItem(`pickup:${transferId}:interior`);
      if (ext) setExteriorImageUrls(JSON.parse(ext));
      if (inte) setInteriorImageUrls(JSON.parse(inte));
    } catch { }
  }, [transferId]);

  /* ───────────────────────────────── fetch traslado ────────────────────────── */
  useEffect(() => {
    if (!transferId) { setIsLoading(false); return; }

    (async () => {
      try {
        setIsLoading(true);
        const data = await TransferService.getTransferById(transferId);
        setTransfer(data);

        // Regla: solo el drover asignado y ventana de 24 horas
        const assignedDroverId = data?.droverId || data?.drover?.id;
        if (!user?.id || !assignedDroverId || String(user.id) !== String(assignedDroverId)) {
          setAccessBlocked(true);
          setAccessWarning('Solo el drover asignado puede realizar esta verificación.');
          toast.warning('Solo el drover asignado puede realizar esta verificación.');
          return;
        }

        const dateStr = data?.travelDate || data?.pickupDetails?.pickupDate;
        const timeStr = data?.travelTime || data?.pickupDetails?.pickupTime;
        if (dateStr && timeStr) {
          const dt = buildLocalDateTime(dateStr, timeStr);
          if (!dt) { setIsLoading(false); return; }

          const now = new Date();
          // Ventana de 24 horas antes y después de la hora programada
          const minusWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const plusWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

          if (dt < minusWindow) {
            setAccessBlocked(true);
            setAccessWarning('La hora de recogida ya pasó (ventana de 24 horas expirada). Contacta a soporte para reprogramar.');
            toast.warning('La hora de recogida ya pasó (ventana 24h).');
            return;
          }
          if (dt > plusWindow) {
            setAccessBlocked(true);
            setAccessWarning('Aún es muy temprano para iniciar la recogida. Solo se habilita dentro de las 24 horas previas a la hora programada.');
            toast.warning('Aún es muy temprano para iniciar la recogida (ventana 24h).');
            return;
          }
        }
      } catch {
        toast.error('Error al cargar el traslado');
      } finally { setIsLoading(false); }
    })();
  }, [transferId]);

  /* ──────────────────────────────── image upload helpers ──────────────────────────── */
  const fieldId = (type: 'exterior' | 'interior', key: string) => `${type}:${key}`;
  const handleImageUpload = async (
    type: 'exterior' | 'interior',
    key: string,
    file: File
  ) => {
    if (!transferId) return;
    const id = fieldId(type, key);
    setUploading(prev => ({ ...prev, [id]: true }));

    try {
      // Comprimir imagen antes de subir para acelerar en móviles
      const optimized = await compressImage(file, 1600, 0.75);
      // Subir imagen al storage - solo enviamos folderPath
      const folderPath = `travel/${transferId}/pickup/${type}`;
      const imageUrl = await StorageService.uploadImage(optimized, folderPath);

      if (imageUrl) {
        console.log('URL de imagen recibida:', imageUrl);

        // Guardar URL real devuelta por el servicio
        if (type === 'exterior') {
          setExteriorImageUrls(prev => {
            const next = { ...prev, [key]: imageUrl };
            try { localStorage.setItem(`pickup:${transferId}:exterior`, JSON.stringify(next)); } catch { }
            return next;
          });
        } else {
          setInteriorImageUrls(prev => {
            const next = { ...prev, [key]: imageUrl };
            try { localStorage.setItem(`pickup:${transferId}:interior`, JSON.stringify(next)); } catch { }
            return next;
          });
        }
        toast.success('Imagen subida correctamente');
      } else {
        throw new Error('Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleImageChange = (
    type: 'exterior' | 'interior',
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleImageUpload(type, key, file);
  };

  const removeImage = (type: 'exterior' | 'interior', key: string) => {
    if (type === 'exterior') {
      setExteriorImageUrls(prev => {
        const updated = { ...prev };
        delete updated[key];
        try { localStorage.setItem(`pickup:${transferId}:exterior`, JSON.stringify(updated)); } catch { }
        return updated;
      });
    } else {
      setInteriorImageUrls(prev => {
        const updated = { ...prev };
        delete updated[key];
        try { localStorage.setItem(`pickup:${transferId}:interior`, JSON.stringify(updated)); } catch { }
        return updated;
      });
    }
    toast.success('Imagen eliminada');
  };

  /* ─────────────────────────────── navegación ─────────────────────────────── */
  const handleNext = () => currentStep < STEPS.SUMMARY && setCurrentStep(v => v + 1);
  const handlePrevious = () => currentStep > STEPS.VEHICLE_EXTERIOR && setCurrentStep(v => v - 1);

  /* ─────────────────────────── envío de verificación ───────────────────────── */
  const handleSubmitVerification = async () => {
    try {
      // Estructurar datos según PickupVerificationDto
      const exteriorPhotos = {
        frontView: exteriorImageUrls['frontal'] || '',
        rearView: exteriorImageUrls['trasera'] || '',
        leftFront: exteriorImageUrls['lateral_izq_front'] || '',
        leftRear: exteriorImageUrls['lateral_izq_rear'] || '',
        rightFront: exteriorImageUrls['lateral_der_front'] || '',
        rightRear: exteriorImageUrls['lateral_der_rear'] || ''
      };

      const interiorPhotos = {
        dashboard: interiorImageUrls['tablero'] || '',
        driverSeat: interiorImageUrls['asiento_conductor'] || '',
        passengerSeat: interiorImageUrls['asiento_pasajero'] || '',
        rearLeftSeat: interiorImageUrls['asiento_trasero_izq'] || '',
        rearRightSeat: interiorImageUrls['asiento_trasero_der'] || '',
        trunk: interiorImageUrls['maletero'] || ''
      };

      const data: any = {
        exteriorPhotos,
        interiorPhotos,
        signature: signature,
        droverSignature: droverSignature || undefined,
        comments: comments || '',
        verifiedAt: new Date().toISOString()
      };

      console.log('Enviando datos de verificación estructurados:', data);
      await submitVerification(data);
      setCurrentStep(STEPS.SUMMARY);
      toast.success('Verificación enviada');
      // Limpiar borrador local
      try {
        localStorage.removeItem(`pickup:${transferId}:exterior`);
        localStorage.removeItem(`pickup:${transferId}:interior`);
      } catch { }
      clearDraft();
      // Invalidar y refetch del viaje para que la vista activa muestre estado actualizado
      try { (window as any).__queryClient?.invalidateQueries?.({ queryKey: ['active-trip', transferId] }); } catch { }
      // Redirigir al detalle e iniciar viaje automáticamente
      // Realizamos la actualización de estado a IN_PROGRESS (startTravel) sin bloquear la navegación
      try { await TransferService.saveInitTravelVerification(transferId!); } catch { }
      navigate(`/traslados/activo/${transferId}`);
    } catch (error) {
      console.error('Error al enviar verificación:', error);
      toast.error('Error al enviar la verificación');
    }
  };

  /* ─────────────────────────────── render helpers ──────────────────────────── */
  const canProceed = () => {
    switch (currentStep) {
      case STEPS.VEHICLE_EXTERIOR: return Object.keys(exteriorImageUrls).length >= 6;
      case STEPS.VEHICLE_INTERIOR: return Object.keys(interiorImageUrls).length >= 6;
      case STEPS.SIGNATURE_COMMENTS: return !!signature.trim();
      default: return true;
    }
  };

  const getStepIcon = (s: number) =>
    s === STEPS.SUMMARY ? <Check size={20} />
      : s === STEPS.CONFIRMATION ? <User size={20} />
        : s === STEPS.SIGNATURE_COMMENTS ? <FileText size={20} />
          : <Camera size={20} />;

  const isUploadingAny = React.useMemo(() => Object.values(uploading).some(Boolean), [uploading]);

  const renderStep = () => {
    /* exterior / interior UI idénticos → helper */
    const renderGrid = (keys: string[], type: 'exterior' | 'interior', labels: Record<string, string>) => {
      const urls = type === 'exterior' ? exteriorImageUrls : interiorImageUrls;

      return (
        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
          {keys.map(k => (
            <div key={k} className="space-y-2">
              <p className="text-white/80 text-sm min-h-10">{labels[k]}</p>
              <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                {urls[k] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={urls[k]}
                      alt={labels[k]}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Error cargando imagen:', urls[k]);
                        // Fallback: mostrar un placeholder si la imagen no carga
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Imagen cargada correctamente:', urls[k]);
                      }}
                    />
                    <Button variant="destructive" size="icon"
                      onClick={() => removeImage(type, k)}
                      disabled={!!uploading[fieldId(type, k)] || accessBlocked}
                      className="absolute top-2 right-2 h-6 w-6">✕</Button>
                  </div>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/20 rounded-lg transition-colors">
                    {uploading[fieldId(type, k)] ? (
                      <Loader className="h-8 w-8 text-white/70 animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white/70" />
                    )}
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      disabled={!!uploading[fieldId(type, k)] || accessBlocked}
                      onChange={e => handleImageChange(type, k, e)} />
                  </label>
                )}
              </div>

              {/* Debug info - mostrar URL */}
              {urls[k] && (
                <div className="text-xs text-white/50 break-all">
                  URL: {urls[k].substring(0, 50)}...
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };

    switch (currentStep) {
      case STEPS.VEHICLE_EXTERIOR:
        const exteriorLabels = {
          frontal: 'Vista frontal',
          trasera: 'Vista trasera',
          lateral_izq_front: 'Lateral izquierdo (delantero)',
          lateral_izq_rear: 'Lateral izquierdo (trasero)',
          lateral_der_front: 'Lateral derecho (delantero)',
          lateral_der_rear: 'Lateral derecho (trasero)'
        };
        return (
          <>
            <p className="text-white text-center">Toma 6 fotos del exterior del vehículo</p>
            {renderGrid(['frontal', 'trasera', 'lateral_izq_front', 'lateral_izq_rear', 'lateral_der_front', 'lateral_der_rear'], 'exterior', exteriorLabels)}
          </>
        );

      case STEPS.VEHICLE_INTERIOR:
        const interiorLabels = {
          tablero: 'Panel de control',
          asiento_conductor: 'Asiento conductor',
          asiento_pasajero: 'Asiento pasajero',
          asiento_trasero_izq: 'Asiento trasero izquierdo',
          asiento_trasero_der: 'Asiento trasero derecho',
          maletero: 'Maletero'
        };
        return (
          <>
            <p className="text-white text-center">Toma 6 fotos del interior del vehículo</p>
            {renderGrid(['tablero', 'asiento_conductor', 'asiento_pasajero', 'asiento_trasero_izq', 'asiento_trasero_der', 'maletero'], 'interior', interiorLabels)}
          </>
        );

      case STEPS.SIGNATURE_COMMENTS:
        return (
          <>
            <label className="block text-white mb-2">Firma de la persona que entrega</label>
            <div className="bg-white rounded-lg p-4 mb-6">
              <SignatureCanvas onSignatureChange={(data) => setSignature(data)} />
            </div>
            <label className="block text-white mb-2">Firma del drover</label>
            <div className="bg-white rounded-lg p-4 mb-6">
              <SignatureCanvas onSignatureChange={(data) => setDroverSignature(data)} />
            </div>
            <label className="block text-white mb-2">Comentarios adicionales</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20"
              placeholder="Añade cualquier observación sobre el estado del vehículo..."
            />
          </>
        );

      case STEPS.CONFIRMATION:
        return (
          <div className="space-y-3 text-white">
            <div className="flex justify-between"><span>Vehículo:</span><span>{transfer?.brandVehicle} {transfer?.modelVehicle}</span></div>
            <div className="flex justify-between"><span>Matrícula:</span><span>{transfer?.patentVehicle}</span></div>
            <div className="flex justify-between"><span>Fotos exteriores:</span><span>{Object.keys(exteriorImageUrls).length}/6</span></div>
            <div className="flex justify-between"><span>Fotos interiores:</span><span>{Object.keys(interiorImageUrls).length}/6</span></div>
            <div className="flex justify-between"><span>Firma:</span><span>{signature ? 'Capturada' : 'Pendiente'}</span></div>
          </div>
        );

      case STEPS.SUMMARY:
        return (
          <div className="text-center space-y-4">
            <Check className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-white text-xl">Verificación completada</h3>
            <p className="text-white/70">La recogida del vehículo ha sido verificada exitosamente</p>
          </div>
        );
    }
  };

  /* ────────────────────────────────── UI ──────────────────────────────────── */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-[#6EF7FF]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!transfer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-white text-lg">Traslado no encontrado</p>
          <Button onClick={() => navigate('/drover/dashboard')}
            className="bg-[#6EF7FF] text-[#22142A] hover:bg-[#6EF7FF]/90">
            Volver al Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        {accessWarning && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-400 bg-amber-500/15 text-amber-100">
            <AlertTriangle className="h-5 w-5" />
            <div className='flex-1'>
              <div className="font-semibold">No puedes completar la verificación todavía</div>
              <div className="text-sm opacity-90">{accessWarning}</div>
              {scheduledPickupText && (
                <div className="text-sm mt-1 opacity-90">Fecha programada: {scheduledPickupText}</div>
              )}
            </div>
          </div>
        )}
        {/* encabezado */}
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verificación de Recogida</h1>
          <div className="text-white/70">
            <p>{transfer.vehicleDetails?.brand} {transfer.vehicleDetails?.model}</p>
            <p>{transfer.vehicleDetails?.licensePlate}</p>
            <p>ID: {transferId}</p>
          </div>
        </div>

        {/* pasos */}
        <div className="flex lg:justify-between items-center mb-8 overflow-x-auto gap-4 flex-wrap">
          {Object.entries(STEP_NAMES).map(([step, name], index) => {
            const s = Number(step);
            const active = s === currentStep;
            const complete = s < currentStep;
            const stepNumber = index + 1;

            return (
              <div
                key={step}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
          ${active
                    ? 'bg-[#6EF7FF] text-[#22142A]'
                    : complete
                      ? 'bg-green-700 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
              >
                {/* Número del paso en un circulito */}
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
            ${active
                      ? 'bg-[#22142A] text-[#6EF7FF]'
                      : complete
                        ? 'bg-white text-green-600'
                        : 'bg-white/20 text-white/80'
                    }`}
                >
                  {stepNumber}
                </div>

                {getStepIcon(s)}
                <span className="text-sm font-medium whitespace-nowrap">{name}</span>
              </div>
            );
          })}
        </div>


        {/* tarjeta principal */}
        {!accessBlocked && (
          <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {STEP_NAMES[currentStep as keyof typeof STEP_NAMES]}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {renderStep()}

              {/* controles */}
              <div className="flex justify-between pt-6">
                {currentStep !== STEPS.VEHICLE_EXTERIOR && currentStep !== STEPS.SUMMARY && (
                  <Button variant="outline" onClick={handlePrevious}
                    className="border-white/20 text-white hover:bg-white/10">
                    <ArrowLeft size={16} className="mr-2" /> Anterior
                  </Button>
                )}

                {currentStep === STEPS.SUMMARY ? (
                  <Button onClick={() => navigate('/drover/dashboard')}
                    className="bg-green-500 hover:bg-green-600 text-white ml-auto">
                    Volver al Dashboard
                  </Button>
                ) : currentStep === STEPS.CONFIRMATION ? (
                  <Button onClick={handleSubmitVerification}
                    disabled={isSubmitting || !canProceed() || accessBlocked || isUploadingAny}
                    className="bg-green-500 hover:bg-green-600 text-white ml-auto">
                    {isSubmitting
                      ? (<><Loader className="mr-2 h-4 w-4 animate-spin" />Enviando…</>)
                      : 'Enviar Verificación'}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!canProceed() || accessBlocked || isUploadingAny}
                    className="bg-[#6EF7FF] text-[#22142A] hover:bg-[#6EF7FF]/90 disabled:opacity-50 ml-auto">
                    Siguiente <ArrowRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {accessBlocked && (
          <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">Recogida programada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 text-center">
                {scheduledPickupText ? (
                  <p>Fecha programada de recogida: <span className="font-semibold text-white">{scheduledPickupText}</span></p>
                ) : (
                  <p>Consulta la Fecha programada en el detalle del traslado.</p>
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={() => navigate('/drover/dashboard')} className="bg-[#6EF7FF] text-[#22142A] hover:bg-[#6EF7FF]/90">
                  Volver al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PickupVerification;
