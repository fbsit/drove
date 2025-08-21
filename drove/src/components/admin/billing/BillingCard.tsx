
import React from "react";
import { CreditCard, FileText, Check, Euro, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRANSFER_STATUS_LABELS: Record<string, string> = {
  completado: "Completado",
  en_proceso: "En proceso",
  asignado: "Asignado",
  pendiente: "Pendiente",
  cancelado: "Cancelado",
};

interface BillingCardProps {
  billing: {
    transferId: string;
    client: string;
    method: "tarjeta" | "transferencia";
    paymentDate: string;
    transferStatus: string;
    invoiceStatus: "emitida" | "no_emitida";
    invoicePdf?: string | null;
  };
  onEmitInvoice: () => void;
}

const BillingCard: React.FC<BillingCardProps> = ({ billing, onEmitInvoice }) => (
  <div className="rounded-2xl bg-white/10 px-4 py-3 shadow-lg flex flex-col transition-all relative group" style={{ fontFamily: "Helvetica" }}>
    <div className="flex items-center gap-2 justify-between min-w-0" tabIndex={0}>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-base font-bold text-white leading-snug truncate">{billing.transferId}</span>
        <span className="text-xs text-white/60 truncate">{billing.paymentDate}</span>
      </div>
      <div>
        {billing.method === "tarjeta" ? (
          <CreditCard size={22} className="text-[#6EF7FF]" />
        ) : (
          <Banknote size={22} className="text-[#6EF7FF]" />
        )}
      </div>
    </div>
    {/* Cliente y estados */}
    <div className="mt-2 flex flex-wrap gap-1 items-center justify-between text-sm">
      <span className="truncate max-w-[60%] text-white font-semibold">{billing.client}</span>
      <span className={`truncate ml-2 text-xs rounded-xl px-2 py-1 font-bold ${billing.transferStatus === "completado" ? "bg-green-600" : "bg-white/10 text-white/60"}`}>
        {TRANSFER_STATUS_LABELS[billing.transferStatus] || billing.transferStatus}
      </span>
    </div>
    {/* Factura */}
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs font-semibold">
        Estado Factura:&nbsp;
        <span className={billing.invoiceStatus === "emitida" ? "text-green-400" : "text-yellow-400"}>
          {billing.invoiceStatus === "emitida" ? "Emitida" : "No emitida"}
        </span>
      </span>
      {billing.invoicePdf ? (
        <Button size="sm" variant="ghost" className="rounded-2xl bg-[#22142A] hover:bg-[#403E43] text-white font-bold shadow-none">
          <FileText size={16} /> <span className="ml-2">Ver Factura</span>
        </Button>
      ) : (
        <Button size="sm" variant="ghost" className="rounded-2xl bg-[#6EF7FF] text-[#22142A] font-bold hover:bg-[#32dfff]" onClick={onEmitInvoice}>
          <Check size={16} /> <span className="ml-2">Emitir Factura</span>
        </Button>
      )}
    </div>
  </div>
);

export default BillingCard;
