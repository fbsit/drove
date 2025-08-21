import React, { useEffect, useRef } from 'react';
import ImageUploader from '../ImageUploader';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Card } from '@/components/ui/card';

interface VehicleExteriorStepProps {
  transferId: string;
  onImagesReady: (images: Record<string, string> | null) => void;
  onImagesChanged: (allImagesSelected: boolean) => void;
}

const REQUIRED_IMAGES: Record<string, string> = {
  frontView:  'Vista frontal',
  rearView:   'Vista trasera',
  leftFront:  'Lateral izquierdo (delantero)',
  leftRear:   'Lateral izquierdo (trasero)',
  rightFront: 'Lateral derecho (delantero)',
  rightRear:  'Lateral derecho (trasero)',
};

type ImageKey = keyof typeof REQUIRED_IMAGES;

const VehicleExteriorStep: React.FC<VehicleExteriorStepProps> = ({
  onImagesReady,
  onImagesChanged,
}) => {
  const { images, isUploading, handleImageChange, removeImage } =
    useImageUpload();

  const readyRef = useRef(false);

  useEffect(() => {
    const keys = Object.keys(REQUIRED_IMAGES) as ImageKey[];
    const allSelected = keys.every((k) => Boolean(images[k]?.file));

    onImagesChanged(allSelected);

    if (allSelected && !readyRef.current) {
      const ready: Record<string, string> = {};
      keys.forEach((k) => (ready[k] = images[k]!.preview));
      onImagesReady(ready);
      readyRef.current = true;
    } else if (!allSelected && readyRef.current) {
      onImagesReady(null);
      readyRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return (
    <div className="space-y-6">
      <p className="text-white/70">
        Por favor, captura fotos claras del exterior del vehículo desde todos los
        ángulos solicitados.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="grid grid-cols-1 gap-6">
          {(Object.keys(REQUIRED_IMAGES) as ImageKey[]).map((key) => (
            <ImageUploader
              key={key}
              id={`exterior-${key}`}
              label={REQUIRED_IMAGES[key]}
              imageUrl={images[key]?.preview || null}
              onChange={(e) => handleImageChange(key, e)}
              onRemove={() => removeImage(key)}
              isUploading={isUploading}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VehicleExteriorStep;
