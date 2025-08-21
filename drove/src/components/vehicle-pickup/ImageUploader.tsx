
import React from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  id: string;
  label: string;
  imageUrl: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isUploading?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  label,
  imageUrl,
  onChange,
  onRemove,
  isUploading = false,
  className = ""
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="text-white/80 text-sm mb-1">{label}</div>
      
      {!imageUrl ? (
        <label 
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Camera className="w-8 h-8 mb-2 text-white/50" />
            <p className="text-sm text-white/50">
              Haz clic para tomar o subir foto
            </p>
          </div>
          <input 
            id={id} 
            type="file" 
            className="hidden" 
            accept="image/*"
            capture="environment"
            onChange={onChange} 
            disabled={isUploading}
          />
        </label>
      ) : (
        <div className="relative w-full h-40">
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover rounded-xl"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
