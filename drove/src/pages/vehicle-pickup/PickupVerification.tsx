/* pages/PickupVerification.tsx
   – Sube imágenes inmediatamente con StorageService usando solo folderPath
   – Envía datos estructurados según PickupVerificationDto
*/
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button }                      from '@/components/ui/button';
import {
  Check, ArrowLeft, ArrowRight, Camera, FileText, User, Loader,
} from 'lucide-react';
import { toast }                       from 'sonner';
import DashboardLayout                 from '@/components/layout/DashboardLayout';
import { TransferService }             from '@/services/transferService';
import { usePickupVerification }       from '@/hooks/usePickupVerification';
import { StorageService }              from '@/services/storageService';

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
  VEHICLE_EXTERIOR : 1,
  VEHICLE_INTERIOR : 2,
  SIGNATURE_COMMENTS: 3,
  CONFIRMATION     : 4,
  SUMMARY          : 5,
} as const;

const STEP_NAMES = {
  [STEPS.VEHICLE_EXTERIOR] : 'Fotos Exterior',
  [STEPS.VEHICLE_INTERIOR] : 'Fotos Interior',
  [STEPS.SIGNATURE_COMMENTS]: 'Firma y Comentarios',
  [STEPS.CONFIRMATION]     : 'Confirmación',
  [STEPS.SUMMARY]          : 'Resumen',
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
  const { transferId }               = useParams<{ transferId: string }>();
  const navigate                     = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.VEHICLE_EXTERIOR);
  const [transfer, setTransfer]       = useState<any>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    signature,
    comments,
    setSignature,
    setComments,
    submitVerification,
    isLoading: isSubmitting,
  } = usePickupVerification(transferId!);

  // URLs de las imágenes subidas estructuradas según DTOs
  const [exteriorImageUrls, setExteriorImageUrls] = useState<Record<string, string>>({});
  const [interiorImageUrls, setInteriorImageUrls] = useState<Record<string, string>>({});

  /* ───────────────────────────────── fetch traslado ────────────────────────── */
  useEffect(() => {
    if (!transferId) { setIsLoading(false); return; }

    (async () => {
      try {
        setIsLoading(true);
        const data = await TransferService.getTransferById(transferId);
        setTransfer(data);
      } catch {
        toast.error('Error al cargar el traslado');
      } finally { setIsLoading(false); }
    })();
  }, [transferId]);

  /* ──────────────────────────────── image upload helpers ──────────────────────────── */
  const handleImageUpload = async (
    type: 'exterior' | 'interior',
    key: string,
    file: File
  ) => {
    if (!transferId) return;

    setIsUploadingImage(true);
    
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
          setExteriorImageUrls(prev => ({ ...prev, [key]: imageUrl }));
        } else {
          setInteriorImageUrls(prev => ({ ...prev, [key]: imageUrl }));
        }
        toast.success('Imagen subida correctamente');
      } else {
        throw new Error('Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploadingImage(false);
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
        return updated;
      });
    } else {
      setInteriorImageUrls(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
    toast.success('Imagen eliminada');
  };

  /* ─────────────────────────────── navegación ─────────────────────────────── */
  const handleNext     = () => currentStep < STEPS.SUMMARY    && setCurrentStep(v => v + 1);
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

      const data = {
        exteriorPhotos,
        interiorPhotos,
        signature: signature,
        comments: comments || '',
        verifiedAt: new Date().toISOString()
      };

      console.log('Enviando datos de verificación estructurados:', data);
      await submitVerification(data);
      setCurrentStep(STEPS.SUMMARY);
      toast.success('Verificación enviada');
      navigate(`/traslados/activo/${transferId}`);
    } catch (error) {
      console.error('Error al enviar verificación:', error);
      toast.error('Error al enviar la verificación');
    }
  };

  /* ─────────────────────────────── render helpers ──────────────────────────── */
  const canProceed = () => {
    switch (currentStep) {
      case STEPS.VEHICLE_EXTERIOR : return Object.keys(exteriorImageUrls).length >= 6;
      case STEPS.VEHICLE_INTERIOR : return Object.keys(interiorImageUrls).length >= 6;
      case STEPS.SIGNATURE_COMMENTS: return !!signature.trim();
      default                     : return true;
    }
  };

  const getStepIcon = (s:number) =>
    s === STEPS.SUMMARY           ? <Check  size={20}/>
    : s === STEPS.CONFIRMATION    ? <User   size={20}/>
    : s === STEPS.SIGNATURE_COMMENTS ? <FileText size={20}/>
    : <Camera size={20}/>;

  const renderStep = () => {
    /* exterior / interior UI idénticos → helper */
    const renderGrid = (keys: string[], type: 'exterior' | 'interior', labels: Record<string, string>) => {
      const urls = type === 'exterior' ? exteriorImageUrls : interiorImageUrls;
      
      return (
        <div className="grid grid-cols-2 gap-4">
          {keys.map(k => (
            <div key={k} className="space-y-2">
              <p className="text-white/80 text-sm">{labels[k]}</p>
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
                      disabled={isUploadingImage}
                      className="absolute top-2 right-2 h-6 w-6">✕</Button>
                  </div>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/20 rounded-lg transition-colors">
                    {isUploadingImage ? (
                      <Loader className="h-8 w-8 text-white/70 animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white/70"/>
                    )}
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      disabled={isUploadingImage}
                      onChange={e => handleImageChange(type, k, e)}/>
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
            {renderGrid(['frontal','trasera','lateral_izq_front','lateral_izq_rear','lateral_der_front','lateral_der_rear'],'exterior', exteriorLabels)}
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
            {renderGrid(['tablero','asiento_conductor','asiento_pasajero','asiento_trasero_izq','asiento_trasero_der','maletero'],'interior', interiorLabels)}
          </>
        );

      case STEPS.SIGNATURE_COMMENTS:
        return (
          <>
            <label className="block text-white mb-2">Firma del cliente</label>
            <div className="bg-white rounded-lg p-4 h-40 flex items-center justify-center mb-6">
              { signature
                ? <p className="text-gray-600">Firma capturada</p>
                : <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer"
                    onClick={() => setSignature('firma_base64')}>
                    <p className="text-gray-400">Toca para firmar</p>
                  </div> }
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
            <Check className="h-16 w-16 text-green-500 mx-auto"/>
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
          <Loader className="h-8 w-8 animate-spin text-[#6EF7FF]"/>
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verificación de Recogida</h1>
          <div className="text-white/70">
            <p>{transfer.vehicleDetails?.brand} {transfer.vehicleDetails?.model}</p>
            <p>{transfer.vehicleDetails?.licensePlate}</p>
            <p>ID: {transferId}</p>
          </div>
        </div>

        {/* pasos */}
        <div className="flex justify-between items-center mb-8 overflow-x-auto">
          {Object.entries(STEP_NAMES).map(([step, name]) => {
            const s = Number(step);
            const active = s === currentStep;
            const complete = s < currentStep;
            return (
              <div key={step}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
                  ${active ? 'bg-[#6EF7FF] text-[#22142A]'
                           : complete ? 'bg-green-500 text-white'
                                      : 'bg-white/10 text-white/70'}`}>
                {getStepIcon(s)} <span className="text-sm font-medium">{name}</span>
              </div>
            );
          })}
        </div>

        {/* tarjeta principal */}
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
                  <ArrowLeft size={16} className="mr-2"/> Anterior
                </Button>
              )}

              {currentStep === STEPS.SUMMARY ? (
                <Button onClick={() => navigate('/drover/dashboard')}
                  className="bg-green-500 hover:bg-green-600 text-white ml-auto">
                  Volver al Dashboard
                </Button>
              ) : currentStep === STEPS.CONFIRMATION ? (
                <Button onClick={handleSubmitVerification}
                  disabled={isSubmitting || !canProceed()}
                  className="bg-green-500 hover:bg-green-600 text-white ml-auto">
                  {isSubmitting
                    ? (<><Loader className="mr-2 h-4 w-4 animate-spin"/>Enviando…</>)
                    : 'Enviar Verificación'}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}
                  className="bg-[#6EF7FF] text-[#22142A] hover:bg-[#6EF7FF]/90 disabled:opacity-50 ml-auto">
                  Siguiente <ArrowRight size={16} className="ml-2"/>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PickupVerification;
