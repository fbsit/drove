
import React from "react";
import { TooltipProvider, Tooltip as TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface InvoiceStatusBadgeProps {
  status: "no_emitida" | "emitida" | "anticipo" | "pagada";
}

const COLORS: Record<string, string> = {
  no_emitida: "bg-[#F1F0FB] text-[#8E9196]",
  emitida: "bg-blue-600 text-white",
  anticipo: "bg-purple-700 text-white",
  pagada: "bg-green-600 text-white",
};

const LABELS: Record<string, string> = {
  no_emitida: "No emitida",
  emitida: "Emitida",
  anticipo: "Anticipada",
  pagada: "Pagada",
};

const FULL_LABELS: Record<string, string> = {
  no_emitida: "Factura no emitida aún",
  emitida: "Factura emitida",
  anticipo: "Anticipada por banco",
  pagada: "Pagada por cliente",
};

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => (
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger asChild>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${COLORS[status]} transition-colors`}
          style={{ fontFamily: "Helvetica" }}
        >
          {LABELS[status] || status}
        </span>
      </TooltipTrigger>
      <TooltipContent>{FULL_LABELS[status]}</TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
);

export default InvoiceStatusBadge;
