
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { StorageService } from '@/services/storageService';
import { optimizeImageForUpload } from '@/lib/image';

const REQUIRED_INTERIOR = {
  dashboard: 'Panel de control',
  driverSeat: 'Asiento conductor',
  passengerSeat: 'Asiento pasajero',
  rearLeftSeat: 'Asiento trasero izquierdo',
  rearRightSeat: 'Asiento trasero derecho',
  trunk: 'Maletero'
} as const;

type InteriorKey = keyof typeof REQUIRED_INTERIOR;

interface Props {
  transferId: string;
  onImagesReady: (images: Record<string, string>) => void;
  onImagesChanged: (isDisabled: boolean) => void;
}

const VehicleInteriorPhotosStep: React.FC<Props> = ({
  transferId,
  onImagesReady,
  onImagesChanged,
}) => {
  const [imageUrls, setImageUrls] = useState<Record<InteriorKey, string>>({} as any);
  // Loading por campo para subidas en paralelo
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Mantener el botón siguiente deshabilitado si falta alguna imagen o aún se está subiendo alguna
  useEffect(() => {
    const allKeys = Object.keys(REQUIRED_INTERIOR) as InteriorKey[];
    const isComplete = allKeys.every(k => Boolean(imageUrls[k]));
    const isUploadingAny = Object.values(uploading).some(Boolean);
    onImagesChanged(!(isComplete && !isUploadingAny));
    if (isComplete && !isUploadingAny) {
      onImagesReady(imageUrls as unknown as Record<string, string>);
    }
  }, [imageUrls, uploading]);

  const handleImageUpload = async (key: InteriorKey, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }));
    
    try {
      const optimized = await optimizeImageForUpload(file, 1600, 0.75);
      const folderPath = `travel/${transferId}/delivery/interior`;
      const imageUrl = await StorageService.uploadImage(optimized, folderPath);
      
      if (imageUrl) {
        setImageUrls(prev => {
          const next = { ...prev, [key]: imageUrl } as Record<InteriorKey, string>;
          const allKeys = Object.keys(REQUIRED_INTERIOR) as InteriorKey[];
          const isComplete = allKeys.every(k => Boolean(next[k]));
          const isUploadingAny = Object.values({ ...uploading, [key]: false }).some(Boolean);
          onImagesChanged(!(isComplete && !isUploadingAny));
          if (isComplete && !isUploadingAny) {
            onImagesReady(next as any);
          }
          return next;
        });
        
        toast.success('Imagen subida correctamente');
      } else {
        throw new Error('Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleImageChange = (key: InteriorKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageUpload(key, file);
  };

  const removeImage = (key: InteriorKey) => {
    const newUrls = { ...imageUrls };
    delete newUrls[key];
    setImageUrls(newUrls);
    
    const allKeys = Object.keys(REQUIRED_INTERIOR) as InteriorKey[];
    const isComplete = allKeys.every(k => newUrls[key]);
    onImagesChanged(!isComplete);
    
    if (isComplete) {
      onImagesReady(newUrls);
    } else {
      onImagesReady({});
    }
    
    toast.success('Imagen eliminada');
  };

  return (
    <div className="space-y-6">
      <p className="text-white/70">
        Toma 6 fotos del interior del vehículo para documentar su estado al momento de la entrega.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(REQUIRED_INTERIOR) as InteriorKey[]).map(key => (
            <div key={key} className="space-y-2">
              <p className="text-white/80 text-sm">{REQUIRED_INTERIOR[key]}</p>
              <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                {imageUrls[key] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageUrls[key]}
                      alt={REQUIRED_INTERIOR[key]}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(key)}
                      disabled={!!uploading[key]}
                      className="absolute top-2 right-2 h-6 w-6"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/20 rounded-lg transition-colors">
                    {uploading[key] ? (
                      <Loader className="h-8 w-8 text-white/70 animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white/70" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={!!uploading[key]}
                      onChange={e => handleImageChange(key, e)}
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VehicleInteriorPhotosStep;
