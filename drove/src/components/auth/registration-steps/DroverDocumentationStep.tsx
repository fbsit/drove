import React, { useEffect, useState } from "react";
import { Upload, Camera, FileText, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { RegistrationFormData } from '@/types/new-registration';
import { StorageService } from '@/services/storageService';

interface Props {
  data: Partial<RegistrationFormData>;
  onUpdate: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

const DroverDocumentationStep: React.FC<Props> = ({ data, onUpdate, onNext }) => {
  type Key = 'profilePhoto' | 'licenseFront' | 'licenseBack' | 'backgroundCheck';

  const [uploads, setUploads] = useState<Record<Key, {
    file: File | null;
    url: string | null;
    loading: boolean;
    error: string | null;
  }>>({
    profilePhoto: {
      file: null,
      url: typeof data.profilePhoto === 'string' ? (data.profilePhoto as string) : null,
      loading: false,
      error: null,
    },
    licenseFront: {
      file: null,
      url: typeof data.licenseFront === 'string' ? (data.licenseFront as string) : null,
      loading: false,
      error: null,
    },
    licenseBack: {
      file: null,
      url: typeof data.licenseBack === 'string' ? (data.licenseBack as string) : null,
      loading: false,
      error: null,
    },
    backgroundCheck: {
      file: null,
      url: typeof data.backgroundCheck === 'string' ? (data.backgroundCheck as string) : null,
      loading: false,
      error: null,
    },
  });

  // Sincronizar URLs al padre cuando cambian
  useEffect(() => {
    onUpdate({
      profilePhoto: uploads.profilePhoto.url || undefined,
      licenseFront: uploads.licenseFront.url || undefined,
      licenseBack: uploads.licenseBack.url || undefined,
      backgroundCheck: uploads.backgroundCheck.url || undefined,
    });
  }, [uploads, onUpdate]);

  const startUpload = async (field: Key, file: File) => {
    setUploads(prev => ({
      ...prev,
      [field]: { ...prev[field], file, loading: true, error: null },
    }));

    try {
      const url = await StorageService.uploadImageDrover(file, 'registrations/drover');
      if (!url) throw new Error('No se pudo subir el archivo');
      setUploads(prev => ({
        ...prev,
        [field]: { ...prev[field], url, loading: false },
      }));
    } catch (err: any) {
      setUploads(prev => ({
        ...prev,
        [field]: { ...prev[field], loading: false, error: err?.message || 'Error al subir' },
      }));
    }
  };

  const handleFileChange = (field: Key, file: File | null) => {
    if (!file) return;
    startUpload(field, file);
  };

  const allUploaded =
    !!uploads.profilePhoto.url &&
    !!uploads.licenseFront.url &&
    !!uploads.licenseBack.url &&
    !!uploads.backgroundCheck.url;

  const anyLoading =
    uploads.profilePhoto.loading ||
    uploads.licenseFront.loading ||
    uploads.licenseBack.loading ||
    uploads.backgroundCheck.loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allUploaded || anyLoading) return;
    onNext();
  };

  const FileUploadBox = ({
    field,
    label,
    description,
    icon: Icon,
    accept,
  }: {
    field: Key;
    label: string;
    description: string;
    icon: any;
    accept: string;
  }) => {
    const { url, loading, error } = uploads[field];
    return (
      <div
        className={`
    border-2 border-dashed rounded-2xl p-6 text-center transition-colors
    ${url ? "bg-green-500/10 border-green-400" : "border-white/20"}
  `}
      >
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white/50">
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-white font-medium mb-2">{label}</h3>
        <p className="text-white/60 text-sm mb-4">{description}</p>

        <div className="relative inline-block">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <div
            className="
      flex items-center justify-center gap-2
      px-6 py-2 rounded-2xl
      border-2 border-[#6EF7FF]
      text-[#6EF7FF] font-medium
      hover:bg-[#6EF7FF] hover:text-[#22142A]
      transition cursor-pointer
    "
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : url ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{loading ? 'Subiendo…' : url ? 'Subido' : 'Subir archivo'}</span>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-red-400 text-sm">{error}</p>
        )}
        {url && !error && (
          <p className="mt-2 text-[#6EF7FF] text-sm font-medium">Archivo subido</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Documentación</h2>

      <FileUploadBox
        field="profilePhoto"
        label="Foto de Perfil"
        description="Foto clara de tu rostro (JPG o PNG)"
        icon={Camera}
        accept="image/*"
      />

      <FileUploadBox
        field="licenseFront"
        label="Licencia de Conducir (Frontal)"
        description="Imagen clara del frente de tu licencia"
        icon={FileText}
        accept="image/*"
      />

      <FileUploadBox
        field="licenseBack"
        label="Licencia de Conducir (Reverso)"
        description="Imagen clara del reverso de tu licencia"
        icon={FileText}
        accept="image/*"
      />

      <FileUploadBox
        field="backgroundCheck"
        label="Certificado de Antecedentes Penales"
        description="Documento oficial (PDF o imagen)"
        icon={Shield}
        accept=".pdf,image/*"
      />

      <button
        type="submit"
        disabled={!allUploaded || anyLoading}
        className={`mt-6 w-full px-6 py-3 rounded-2xl font-bold transition ${
          !allUploaded || anyLoading
            ? 'bg-white/20 text-white/60 cursor-not-allowed'
            : 'bg-[#6EF7FF] text-[#22142A] hover:bg-[#32dfff]'
        }`}
      >
        {anyLoading ? 'Subiendo archivos…' : 'Finalizar Documentación'}
      </button>
    </form>
  );
};

export default DroverDocumentationStep;
