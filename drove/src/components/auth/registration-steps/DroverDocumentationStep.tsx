import React, { useState } from "react";
import { Upload, Camera, FileText, Shield } from "lucide-react";

const DroverDocumentationStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    profilePhoto: null as File | null,
    licenseFront: null as File | null,
    licenseBack: null as File | null,
    backgroundCheck: null as File | null,
  });

  const handleFileChange = (field: keyof typeof formData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.profilePhoto || !formData.licenseFront || !formData.licenseBack || !formData.backgroundCheck) {
      alert("Faltan documentos obligatorios");
      return;
    }
    console.log("Datos del formulario:", formData);
    onNext();
  };

  const FileUploadBox = ({
    field,
    label,
    description,
    icon: Icon,
    accept,
  }: {
    field: keyof typeof formData;
    label: string;
    description: string;
    icon: any;
    accept: string;
  }) => {
    const file = formData[field];
    return (
      <div
        className={`
    border-2 border-dashed rounded-2xl p-6 text-center transition-colors
    ${file ? "bg-green-500/10 border-green-400" : "border-white/20"}
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
            <Upload className="w-4 h-4" />
            <span>Subir archivo</span>
          </div>
        </div>


        {file && (
          <p className="mt-2 text-[#6EF7FF] text-sm font-medium">✓ {file.name}</p>
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
        className="mt-6 w-full px-6 py-3 rounded-2xl font-bold bg-[#6EF7FF] text-[#22142A] hover:bg-[#32dfff] transition"
      >
        Finalizar Documentación
      </button>
    </form>
  );
};

export default DroverDocumentationStep;
