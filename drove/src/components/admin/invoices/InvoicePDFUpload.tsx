
import React, { useRef, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoicePDFUploadProps {
  onUpload: (file: File) => Promise<{ status: "success" | "exists" | "error"; invoiceId?: string; url?: string }>;
  disabled?: boolean;
}

const InvoicePDFUpload: React.FC<InvoicePDFUploadProps> = ({ onUpload, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
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
    const res = await onUpload(file);
    if (res.status === "success") {
      setInvoiceId(res.invoiceId || null);
      setInvoiceUrl(res.url || null);
      setMsg({type: "success", text: "Factura subida correctamente."});
    } else if (res.status === "exists") {
      setInvoiceId(res.invoiceId || null);
      setInvoiceUrl(res.url || null);
      setMsg({type: "exists", text: "Este traslado ya tiene una factura registrada."});
    } else {
      setMsg({type: "error", text: "Ha ocurrido un error al subir la factura."});
    }
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
        {uploading ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18} />}
        {uploading ? "Subiendo..." : "Subir Factura"}
      </Button>
      <div className="text-xs text-white/50 mt-1">Solo se aceptan archivos en formato PDF</div>
      {fileName && (
        <div className="text-sm text-white/90 flex items-center gap-1 mt-1">
          <FileText size={14}/> {fileName}
        </div>
      )}
      {/* Mostrar un solo indicador de carga: el spinner en el botón */}
      {!uploading && msg && (
        <div className={`mt-3 text-sm w-full rounded-xl px-3 py-2 flex items-center gap-2 ${msg.type === "success" ? "bg-green-600/30 text-green-200 border border-green-500/40" : (msg.type === "error" ? "bg-red-600/30 text-red-200 border border-red-500/40" : "bg-yellow-600/30 text-yellow-100 border border-yellow-500/40")}`}>
          {msg.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
          <span>{msg.text}</span>
        </div>
      )}
      {!uploading && (invoiceId || invoiceUrl) && (
        <div className="mt-2 text-xs text-white/70">
          {invoiceId && <div><strong>ID Factura:</strong> {invoiceId}</div>}
          {invoiceUrl && (
            <div>
              <a className="text-[#6EF7FF] underline" href={invoiceUrl} target="_blank" rel="noreferrer">Ver factura</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicePDFUpload;
