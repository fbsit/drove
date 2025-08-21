
import { useState } from 'react';
import { uploadMultipleImages } from '@/services/storageService';
import { toast } from '@/hooks/use-toast';

interface ImageFile {
  file: File;
  preview: string;
}

export const useImageUpload = (maxSizeMB: number = 15) => {
  const [images, setImages] = useState<Record<string, ImageFile | null>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tamaño
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `La imagen es demasiado grande. El tamaño máximo es ${maxSizeMB}MB.`
        });
        return;
      }

      // Crear URL para preview
      const preview = URL.createObjectURL(file);
      
      setImages(prev => ({
        ...prev,
        [key]: { file, preview }
      }));
    }
  };

  const removeImage = (key: string) => {
    setImages(prev => {
      const updated = { ...prev };
      if (updated[key]?.preview) {
        URL.revokeObjectURL(updated[key]!.preview);
      }
      updated[key] = null;
      return updated;
    });
  };

  const uploadImages = async (transferId: string, category: string): Promise<Record<string, string> | null> => {
    // Verificar que todas las imágenes requeridas estén presentes
    const areAllImagesPresent = Object.values(images).every(img => img !== null);
    if (!areAllImagesPresent) {
      toast({
        variant: "destructive",
        title: "Faltan imágenes",
        description: "Por favor, sube todas las imágenes requeridas antes de continuar."
      });
      return null;
    }

    setIsUploading(true);
    try {
      // Preparar objeto solo con los archivos (sin previews)
      const files: Record<string, File> = {};
      Object.entries(images).forEach(([key, value]) => {
        if (value) {
          files[key] = value.file;
        }
      });

      // Subir imágenes
      const result = await uploadMultipleImages(files, transferId, category);
      
      if (!result) {
        throw new Error("Error al subir las imágenes");
      }

      return result;
    } catch (error) {
      console.error("Error en la subida de imágenes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron subir las imágenes. Inténtalo de nuevo."
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    images,
    isUploading,
    handleImageChange,
    removeImage,
    uploadImages
  };
};
