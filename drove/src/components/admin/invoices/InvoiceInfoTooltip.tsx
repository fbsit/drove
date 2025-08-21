
import React from "react";
import { X, ArrowRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface InvoiceInfoTooltipProps {
  trigger: React.ReactNode;
  invoice: {
    client: string;
    invoiceId: string;
    transferId: string;
    notes: string;
  };
}

const InvoiceInfoTooltip: React.FC<InvoiceInfoTooltipProps> = ({ trigger, invoice }) => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span tabIndex={0} onClick={() => setOpen(true)}>{trigger}</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="rounded-2xl bg-[#22142A] text-white max-w-xs md:max-w-sm w-[90vw] p-4 border-none shadow-xl"
        style={{ fontFamily: "Helvetica", minWidth: "260px" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold" style={{ fontFamily: "Helvetica" }}>
            Información de Factura
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="ml-2 text-white/70 hover:text-white focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-60 overflow-auto pr-1 text-sm">
          <div>
            <span className="font-bold">Cliente:</span> {invoice.client}
          </div>
          <div>
            <span className="font-bold">ID de Pago:</span> {invoice.invoiceId}-{invoice.transferId}
          </div>
          <div>
            <span className="font-bold">Notas:</span> {invoice.notes ? invoice.notes : <span className="text-white/40">Sin comentarios adicionales</span>}
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <Button
            size="sm"
            className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold px-4 gap-2 shadow-md"
            onClick={() => {
              setOpen(false);
              // CAMBIO: Ruta corregida de /ver-traslado/ a /traslados/
              navigate(`/traslados/${invoice.transferId}`);
            }}
          >
            Ver más detalles
            <ArrowRight size={14} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InvoiceInfoTooltip;
