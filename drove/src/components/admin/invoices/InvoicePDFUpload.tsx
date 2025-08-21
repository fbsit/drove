
import React, { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoicePDFUploadProps {
  onUpload: (file: File) => Promise<"success" | "exists" | "error">;
  disabled?: boolean;
}

const InvoicePDFUpload: React.FC<InvoicePDFUploadProps> = ({ onUpload, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{type: "success" | "error" | "exists"; text: string} | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setMsg(null);
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMsg({ type: "error", text: "Formato no válido: solo se aceptan archivos PDF." });
      return;
    }
    setFileName(file.name);
    setUploading(true);
    // TODO conectar backend
    const res = await onUpload(file);
    if (res === "success") setMsg({type: "success", text: "Factura subida correctamente."});
    if (res === "exists") setMsg({type: "exists", text: "Este traslado ya tiene una factura."});
    if (res === "error") setMsg({type: "error", text: "Ha ocurrido un error al subir la factura."});
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="file"
        accept="application/pdf"
        ref={fileInput}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={disabled || uploading}
        className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold py-2 px-6 flex gap-2 items-center"
        title="Subir Factura"
      >
        <Upload size={18} />
        {uploading ? "Subiendo..." : "Subir Factura"}
      </Button>
      <div className="text-xs text-white/50 mt-1">
        Solo se aceptan archivos en formato PDF
      </div>
      {fileName && (
        <div className="text-sm text-white/90 flex items-center gap-1 mt-1">
          <FileText size={14}/> {fileName}
        </div>
      )}
      {msg && (
        <div className={`text-sm mt-1 rounded-xl px-3 py-1 ${msg.type === "success" ? "bg-green-700/80 text-white" : (msg.type === "error" ? "bg-red-800/80 text-white" : "bg-yellow-700/80 text-white")}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
};

export default InvoicePDFUpload;
