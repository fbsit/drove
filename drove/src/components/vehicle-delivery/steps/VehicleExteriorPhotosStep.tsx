
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { StorageService } from '@/services/storageService';
import { optimizeImageForUpload } from '@/lib/image';

const REQUIRED_EXTERIOR = {
  frontView: 'Vista frontal',
  rearView: 'Vista trasera', 
  leftFront: 'Lateral izquierdo (delantero)',
  leftRear: 'Lateral izquierdo (trasero)',
  rightFront: 'Lateral derecho (delantero)',
  rightRear: 'Lateral derecho (trasero)'
} as const;

type ExteriorKey = keyof typeof REQUIRED_EXTERIOR;

interface Props {
  transferId: string;
  onImagesReady: (images: Record<string, string>) => void;
  onImagesChanged: (isDisabled: boolean) => void;
}

const VehicleExteriorPhotosStep: React.FC<Props> = ({
  transferId,
  onImagesReady,
  onImagesChanged,
}) => {
  const [imageUrls, setImageUrls] = useState<Record<ExteriorKey, string>>({} as any);
  // Loading por campo para subidas en paralelo
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Mantener el botón siguiente deshabilitado si falta alguna imagen o aún se está subiendo alguna
  useEffect(() => {
    const allKeys = Object.keys(REQUIRED_EXTERIOR) as ExteriorKey[];
    const isComplete = allKeys.every(k => Boolean(imageUrls[k]));
    const isUploadingAny = Object.values(uploading).some(Boolean);
    onImagesChanged(!(isComplete && !isUploadingAny));
    if (isComplete && !isUploadingAny) {
      onImagesReady(imageUrls as unknown as Record<string, string>);
    }
  }, [imageUrls, uploading]);

  const handleImageUpload = async (key: ExteriorKey, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }));
    
    try {
      const optimized = await optimizeImageForUpload(file, 1600, 0.75);
      const folderPath = `travel/${transferId}/delivery/exterior`;
      const imageUrl = await StorageService.uploadImage(optimized, folderPath);
      
      if (imageUrl) {
        // Evitar condiciones de carrera usando actualizador funcional
        setImageUrls(prev => {
          const next = { ...prev, [key]: imageUrl } as Record<ExteriorKey, string>;
          // Recalcular estado de navegación con el nuevo objeto consolidado
          const allKeys = Object.keys(REQUIRED_EXTERIOR) as ExteriorKey[];
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

  const handleImageChange = (key: ExteriorKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageUpload(key, file);
  };

  const removeImage = (key: ExteriorKey) => {
    const newUrls = { ...imageUrls };
    delete newUrls[key];
    setImageUrls(newUrls);
    
    const allKeys = Object.keys(REQUIRED_EXTERIOR) as ExteriorKey[];
    const isComplete = allKeys.every(k => newUrls[k]);
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
        Toma 6 fotos del exterior del vehículo para documentar su estado al momento de la entrega.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(REQUIRED_EXTERIOR) as ExteriorKey[]).map(key => (
            <div key={key} className="space-y-2">
              <p className="text-white/80 text-sm">{REQUIRED_EXTERIOR[key]}</p>
              <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                {imageUrls[key] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageUrls[key]}
                      alt={REQUIRED_EXTERIOR[key]}
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

export default VehicleExteriorPhotosStep;
