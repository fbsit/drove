
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Camera, FileText, Shield, CheckCircle, Loader2, Check } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';
import { StorageService } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

interface Props {
  data: Partial<RegistrationFormData>;
  onUpdate: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

const DroverDocumentationStep: React.FC<Props> = ({ data, onUpdate, onNext, onPrevious }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    profilePhoto: (data as any).profilePhoto || null,
    licenseFront: (data as any).licenseFront || null,
    licenseBack: (data as any).licenseBack || null,
    backgroundCheck: (data as any).backgroundCheck || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Solución al loop infinito: usar useCallback para onUpdate
  const updateFormData = React.useCallback((newData: any) => {
    onUpdate(newData);
  }, [onUpdate]);

  useEffect(() => {
    updateFormData(formData);
  }, [formData, updateFormData]);

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: null }));
      return;
    }

    // Iniciar estado de carga
    setUploading(prev => ({ ...prev, [field]: true }));

    try {
      const folderPath = `drovers/documentation`;
      const url = await StorageService.uploadImageDrover(file, folderPath);

      if (url) {
        // Guardar la URL en lugar del archivo
        setFormData(prev => {
          const next = { ...prev, [field]: url };   // url o null
          onUpdate(next);                           // <- aviso al padre
          return next;
        });
        toast({
          title: 'Archivo subido exitosamente',
          description: `${file.name} se ha subido correctamente`,
        });
      } else {
        throw new Error('No se pudo obtener la URL del archivo');
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir archivo',
        description: 'No se pudo subir el archivo. Inténtalo de nuevo.',
      });
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.profilePhoto) {
      newErrors.profilePhoto = 'La foto de perfil es obligatoria';
    }

    if (!formData.licenseFront) {
      newErrors.licenseFront = 'La imagen frontal de la licencia es obligatoria';
    }

    if (!formData.licenseBack) {
      newErrors.licenseBack = 'La imagen del reverso de la licencia es obligatoria';
    }

    if (!formData.backgroundCheck) {
      newErrors.backgroundCheck = 'El certificado de antecedentes penales es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  // Componente para mostrar imagen cargada
  const ImagePreview: React.FC<{ url: string; alt: string }> = ({ url, alt }) => (
    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-3">
        <img 
          src={url} 
          alt={alt}
          className="w-16 h-16 object-cover rounded-lg border border-white/20"
        />
        <div className="flex-1">
          <p className="text-white/90 text-sm font-medium">Imagen cargada correctamente</p>
          <p className="text-white/60 text-xs truncate">{alt}</p>
        </div>
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );

  const FileUploadBox = ({
    field,
    label,
    description,
    icon: Icon,
    accept,
    file
  }: {
    field: string;
    label: string;
    description: string;
    icon: any;
    accept: string;
    file: string | File | null;
  }) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isUploading = uploading[field];
    const hasFile = file && (typeof file === 'string' || file instanceof File);
    const fileName = typeof file === 'string' ? 'Archivo subido' : file?.name || '';

    const handleClick = () => {
      inputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFileChange(field, file || null);
    };

    return (
      <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-[#6EF7FF]/50 transition-colors">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hasFile ? 'bg-[#6EF7FF]/20 text-[#6EF7FF]' : 'bg-white/10 text-white/50'
              }`}>
              {hasFile ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
            </div>
          </div>

          <h3 className="text-white font-medium mb-2">{label}</h3>
          <p className="text-white/60 text-sm mb-4">{description}</p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="w-6 h-6 text-[#6EF7FF] animate-spin mx-auto" />
              <p className="text-[#6EF7FF] text-sm">Subiendo archivo...</p>
            </div>
          ) : hasFile ? (
            <div className="space-y-2">
              <p className="text-[#6EF7FF] text-sm font-medium">
                ✓ {fileName}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
              >
                Cambiar archivo
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={handleClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar archivo
            </Button>
          )}

          {errors[field] && (
            <p className="text-red-400 text-sm mt-2">{errors[field]}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Documentación
        </h2>
        <p className="text-white/70">
          Sube los documentos requeridos para completar tu solicitud
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de Perfil */}
        <div>
          <FileUploadBox
            field="profilePhoto"
            label="Foto de Perfil"
            description="Foto clara de tu rostro (formato JPG, PNG)"
            icon={Camera}
            accept="image/*"
            file={formData.profilePhoto}
          />
          {formData.profilePhoto && (
            <ImagePreview url={formData.profilePhoto} alt="Foto de perfil" />
          )}
        </div>

        {/* Licencia Frontal */}
        <div>
          <FileUploadBox
            field="licenseFront"
            label="Licencia de Conducir (Frontal)"
            description="Imagen clara del frente de tu licencia"
            icon={FileText}
            accept="image/*"
            file={formData.licenseFront}
          />
          {formData.licenseFront && (
            <ImagePreview url={formData.licenseFront} alt="Carnet de conducir (anverso)" />
          )}
        </div>

        {/* Licencia Reverso */}
        <div>
          <FileUploadBox
            field="licenseBack"
            label="Licencia de Conducir (Reverso)"
            description="Imagen clara del reverso de tu licencia"
            icon={FileText}
            accept="image/*"
            file={formData.licenseBack}
          />
          {formData.licenseBack && (
            <ImagePreview url={formData.licenseBack} alt="Carnet de conducir (reverso)" />
          )}
        </div>

        {/* Antecedentes Penales */}
        <div>
          <FileUploadBox
            field="backgroundCheck"
            label="Certificado de Antecedentes Penales"
            description="Documento oficial (PDF o imagen)"
            icon={Shield}
            accept=".pdf,image/*"
            file={formData.backgroundCheck}
          />
          {formData.backgroundCheck && (
            <ImagePreview url={formData.backgroundCheck} alt="Certificado de antecedentes penales" />
          )}
        </div>

        <div className="bg-[#6EF7FF]/10 border border-[#6EF7FF]/20 rounded-2xl p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-[#6EF7FF] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium text-sm mb-1">
                Información importante
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Todos los documentos serán verificados por nuestro equipo de seguridad.
                Asegúrate de que las imágenes sean claras y legibles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:justify-between">
          {onPrevious && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="order-2 md:order-1 flex items-center gap-2"
            >
              Anterior
            </Button>
          )}
          
          <Button
            type="submit"
            className="order-1 md:order-2 bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold"
          >
            Continuar a Confirmación
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DroverDocumentationStep;
