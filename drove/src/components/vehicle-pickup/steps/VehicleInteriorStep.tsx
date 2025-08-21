import React, { useEffect, useRef } from 'react';
import ImageUploader from '../ImageUploader';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Card } from '@/components/ui/card';

interface VehicleInteriorStepProps {
  onImagesReady: (images: Record<string, string> | null) => void;
  onImagesChanged: (allImagesSelected: boolean) => void;
}

const REQUIRED_IMAGES: Record<string, string> = {
  dashboard:     'Panel de control / Tablero',
  driverSeat:    'Asiento del conductor',
  passengerSeat: 'Asiento del pasajero',
  rearLeftSeat:  'Asiento trasero izquierdo',
  rearRightSeat: 'Asiento trasero derecho',
  trunk:         'Maletero',
};

type ImageKey = keyof typeof REQUIRED_IMAGES;

const VehicleInteriorStep: React.FC<VehicleInteriorStepProps> = ({
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
        Por favor, captura fotos claras del interior del vehículo, asegurándote
        de documentar todas las áreas solicitadas.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="grid grid-cols-1 gap-6">
          {(Object.keys(REQUIRED_IMAGES) as ImageKey[]).map((key) => (
            <ImageUploader
              key={key}
              id={`interior-${key}`}
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

export default VehicleInteriorStep;
