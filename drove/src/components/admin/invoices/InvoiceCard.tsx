
import React from "react";
import { FileText, Upload, Info, Check, X, Plus, CreditCard, Banknote, Eye, UserPlus, Ban, AlertTriangle } from "lucide-react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { Button } from "@/components/ui/button";
import InvoicePDFUpload from "./InvoicePDFUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip as TooltipRoot, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import InvoiceInfoTooltip from "./InvoiceInfoTooltip";

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceDate?: string;
    client?: string;
    client_name?: string;
    vehicle?: string;
    fromAddress?: string;
    toAddress?: string;
    droverName?: string;
    paymentMethod?: string;
    status?: 'emitida' | 'anticipo' | 'pagada' | string;
    transferStatus?: string;
    urlPDF?: string | null;
    transferId?: string;
    notes?: string;
  };
  onUploadPDF: (file: File, invoiceId: string) => Promise<"success" | "exists" | "error">;
  onChangeStatus: (invoiceId: string, status: "emitida" | "anticipo" | "pagada") => void;
  onRevertStatus: (invoiceId: string) => void;
  onReject?: (invoiceId: string) => void;
  onCancel?: (invoiceId: string) => void;
}

const TRANSFER_STATUS_LABELS: Record<string, string> = {
  completado: "Completado",
  en_proceso: "En proceso",
  asignado: "Asignado",
  pendiente: "Pendiente",
  pendiente_pago: "Pendiente Pago",
  pendiente_factura: "Pendiente Factura",
  cancelado: "Cancelado",
};

const TRANSFER_STATUS_COLORS: Record<string, string> = {
  completado: "bg-green-600",
  en_proceso: "bg-blue-600",
  asignado: "bg-purple-600",
  pendiente: "bg-yellow-500 text-[#22142A]",
  pendiente_pago: "bg-orange-500",
  pendiente_factura: "bg-pink-500",
  cancelado: "bg-red-700 text-white",
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onUploadPDF,
  onChangeStatus,
  onRevertStatus,
  onReject,
  onCancel,
}) => {
  const [uploadDialog, setUploadDialog] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState<{ open: boolean; type: any }>({ open: false, type: undefined });

  // Determinar método de pago y su icono (unificado: tarjeta o débito → "Tarjeta")
  let metodoPago: string = "Transferencia";
  let metodoIcono = <Banknote size={22} className="text-[#6EF7FF]" />;
  if ((invoice.paymentMethod || '').toLowerCase() === "stripe" || (invoice.paymentMethod || '').toLowerCase() === "debito") {
    metodoPago = "Tarjeta";
    metodoIcono = <CreditCard size={22} className="text-[#6EF7FF]" />;
  }

  // Estado visual de pago
  let estadoPago = "";
  if ((invoice.paymentMethod || '').toLowerCase() === "transferencia") {
    if (invoice.status === "anticipo") {
      estadoPago = "Anticipado por banco";
    } else if (invoice.status === "pagada") {
      estadoPago = "Pagado";
    } else {
      estadoPago = TRANSFER_STATUS_LABELS[invoice.transferStatus] || invoice.transferStatus;
    }
  } else {
    estadoPago = (invoice.transferStatus === "pagado" || invoice.status === "pagada") ? "Pagado" : "Pendiente";
  }

  // Subir/ver factura PDF
  const tienePDF = Boolean(invoice.urlPDF);
  // Estado visual de la factura segun backend
  const statusUpper = String(invoice.status || '').toUpperCase();
  let estadoFactura = 'No emitida';
  let estadoFacturaColor = 'text-white/70';
  switch (statusUpper) {
    case 'SENT':
      estadoFactura = 'Emitida';
      estadoFacturaColor = 'text-blue-400';
      break;
    case 'PAID':
      estadoFactura = 'Pagada';
      estadoFacturaColor = 'text-green-400';
      break;
    case 'VOID':
      estadoFactura = 'Anulada';
      estadoFacturaColor = 'text-orange-400';
      break;
    case 'REJECTED':
      estadoFactura = 'Rechazada';
      estadoFacturaColor = 'text-red-400';
      break;
    case 'DRAFT':
    default:
      estadoFactura = 'No emitida';
      estadoFacturaColor = 'text-yellow-400';
      break;
  }

  // Acciones SOLO para transferencia
  const esTransferencia = invoice.paymentMethod === "transferencia";
  // Anticipo solo es posible cuando es transferencia, tiene PDF, y está en estado "emitida"
  const showAnticipo = esTransferencia && tienePDF && invoice.status === "emitida";
  // Pagada solo debe mostrarse si está "emitida" o en "anticipo" y tiene PDF
  const showPagada = esTransferencia && tienePDF && ["emitida", "anticipo"].includes(invoice.status);
  // Revertir solo aparece si está en "anticipo"
  const showRevertir = esTransferencia && tienePDF && invoice.status === "anticipo";

  const handleUploadSuccess = () => {
    // Simular que se subió el PDF y cambiar estado a "emitida"
    onChangeStatus(invoice.id, "emitida");
    toast({
      title: "Factura subida correctamente",
      description: "El estado se ha actualizado a 'Emitida'.",
      duration: 1500
    });
    setUploadDialog(false);
  };

  return (
    <div
      className="rounded-2xl bg-white/10 px-4 py-3 shadow-lg flex flex-col hover:shadow-[0_2px_24px_0_#6EF7FF22] transition-all duration-200 relative group justify-between"
      style={{ fontFamily: "Helvetica", minWidth: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 justify-between min-w-0" tabIndex={0}>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-base font-bold text-white leading-snug truncate">INV-{String(invoice.id).padStart(6, '0')}</span>
          <span className="text-xs text-white/60 truncate">{invoice.invoiceDate}</span>
        </div>
        <div className="flex items-center gap-2">
          {metodoIcono}
          <span className="text-xs text-white/80">{metodoPago}</span>
        </div>
      </div>

      {/* Cliente y estado pago */}
      <div className="mt-2 flex flex-wrap gap-1 items-center justify-between text-sm">
        <span title={invoice.client || invoice.client_name} className="truncate max-w-[60%] text-white font-semibold">{invoice.client || invoice.client_name}</span>
        <span className={`truncate ml-2 text-xs rounded-xl px-2 py-1 font-bold ${estadoPago === "Pagado"
          ? "bg-green-600"
          : estadoPago === "Anticipado por banco"
            ? "bg-purple-600"
            : "bg-white/10 text-white/60"
          }`}>
          {estadoPago}
        </span>
      </div>

      {/* Estado factura (desde backend) */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs font-semibold">
          Estado Factura:&nbsp;
          <span className={estadoFacturaColor}>
            {estadoFactura}
          </span>
        </span>
      </div>

      {/* Ruta y drover (cuando existan) */}
      {(invoice.vehicle || invoice.fromAddress || invoice.toAddress || invoice.droverName) && (
        <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white/80">
          {invoice.vehicle && <div className="mb-1">{invoice.vehicle}</div>}
          {invoice.fromAddress && <div className="mb-1">{invoice.fromAddress}</div>}
          {invoice.toAddress && <div className="mb-1">{invoice.toAddress}</div>}
          {invoice.droverName && <div className="flex items-center justify-center gap-1 text-white/70"><UserPlus size={14} /> Drover: {invoice.droverName}</div>}
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-2 mt-3">
        {!tienePDF ? (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-2xl bg-[#6EF7FF] text-[#22142A] font-bold hover:bg-[#32dfff]"
            onClick={() => setUploadDialog(true)}
          >
            <Upload size={16} />
            <span className="ml-2">Subir Factura</span>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-2xl bg-[#22142A] hover:bg-[#403E43] text-white font-bold shadow-none w-fit"
            onClick={() => window.open(invoice.urlPDF, '_blank')}
          >
            <FileText size={16} />
            <span className="ml-2">Ver Factura</span>
          </Button>
        )}
        <div className="flex flex-row flex-wrap gap-4 items-center text-sm justify-center">
          {!(invoice as any)?.droverName && (
            <Button
              variant="link"
              className="text-white hover:text-white/80 p-0 h-auto"
              onClick={() => window.open(`/admin/asignar/${invoice.transferId || invoice.id}`, '_self')}
            >
              Asignar
            </Button>
          )}
          <Button
            variant="link"
            className="text-white/80 hover:text-white p-0 h-auto flex items-center gap-1"
            onClick={() => window.open(`/traslados/${invoice.transferId}`, '_self')}
          >
            <Eye size={14} /> Ver Traslado
          </Button>
        </div>

        {esTransferencia && (
          <>
            {showAnticipo && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-2xl text-purple-300 hover:bg-purple-700/40 font-bold"
                onClick={() => setConfirmDialog({ open: true, type: "anticipo" })}
                title="Anticipo bancario"
              >
                <Plus size={16} />
                <span className="ml-1">Anticipo</span>
              </Button>
            )}
            {showPagada && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-2xl text-green-400 hover:bg-green-700/30 font-bold"
                onClick={() => setConfirmDialog({ open: true, type: "pagada" })}
                title="Pagada por cliente"
                disabled={invoice.status === "pagada"}
              >
                <Check size={16} />
                <span className="ml-1">Pagada</span>
              </Button>
            )}
            {showRevertir && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-2xl text-slate-400 hover:bg-blue-900/50 font-bold"
                onClick={() => setConfirmDialog({ open: true, type: "revertir" })}
                title="Revertir estado"
              >
                <X size={16} />
                <span className="ml-1">Revertir</span>
              </Button>
            )}
          </>
        )}

        {/* Rechazar / Anular */}
        <div className="flex flex-row gap-6 items-center mt-1 text-sm justify-center">
          <button
            className="flex items-center gap-2 text-red-400 hover:text-red-300"
            onClick={() => setConfirmDialog({ open: true, type: "reject" })}
            title="Rechazar"
          >
            <Ban size={16} />
            <span>Rechazar</span>
          </button>
          <button
            className="flex items-center gap-2 text-orange-400 hover:text-orange-300"
            onClick={() => setConfirmDialog({ open: true, type: "void" })}
            title="Anular"
          >
            <AlertTriangle size={16} />
            <span>Anular</span>
          </button>
        </div>

        {/* Información (siempre visible) */}
        <InvoiceInfoTooltip
          trigger={
            <Button
              size="icon"
              variant="ghost"
              className="rounded-2xl text-[#6EF7FF] ml-1 hover:bg-[#6EF7FF]/10 w-fit px-4"
              aria-label="Información de factura"
              tabIndex={0}
            >
              <Info size={18} />
              <span>Ver más información</span>
            </Button>
          }
          invoice={{
            client: invoice.client || invoice.client_name,
            invoiceId: invoice.id,
            transferId: invoice.transferId || invoice.id,
            notes: invoice.notes,
          }}
        />
      </div>

      {/* Modal subir PDF */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="bg-[#22142A] text-white rounded-2xl max-w-md border-none text-center">
          <DialogHeader>
            <DialogTitle>Subir Factura PDF</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-white/70 mb-3">
              Adjunta el PDF emitido oficialmente en Hacienda para este traslado.
            </p>
            {/* Resumen mínimo de la factura para identificarla */}
            {(() => {
              const anyInv: any = invoice as any;
              const amount = anyInv.amount ?? anyInv.total ?? anyInv.total_with_tax ?? anyInv.price ?? anyInv.totalPrice;
              return (
                <div className="mb-3 text-sm text-white/80 flex flex-col items-center gap-1">
                  <div><b>Factura:</b> INV-{String(invoice.id).padStart(6,'0')}</div>
                  {invoice.invoiceDate && <div><b>Fecha:</b> {invoice.invoiceDate}</div>}
                  {(invoice.client || invoice.client_name) && (
                    <div className="truncate max-w-[280px]"><b>Cliente:</b> {invoice.client || invoice.client_name}</div>
                  )}
                  {typeof amount !== 'undefined' && (
                    <div><b>Monto:</b> €{Number(amount).toLocaleString()}</div>
                  )}
                </div>
              );
            })()}
            <InvoicePDFUpload
              disabled={false}
              onUpload={async file => {
                const res = await onUploadPDF(file, String(invoice.id));
                if (res === 'success') {
                  handleUploadSuccess();
                }
                return res;
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadDialog(false)} className="rounded-2xl">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmación acciones de estado */}
      <Dialog open={confirmDialog.open} onOpenChange={() => setConfirmDialog({ open: false, type: undefined })}>
        <DialogContent className="bg-[#22142A] text-white rounded-2xl max-w-sm border-none">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "pagada"
                ? "Confirmar pago"
                : confirmDialog.type === "anticipo"
                  ? "Confirmar anticipo bancario"
                  : confirmDialog.type === "reject"
                    ? "Confirmar rechazo de factura"
                    : confirmDialog.type === "void"
                      ? "Confirmar anulación de factura"
                      : "Revertir estado"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {confirmDialog.type === "pagada" && (
              <span>¿Seguro que deseas marcar esta factura como <b>pagada por cliente</b>?</span>
            )}
            {confirmDialog.type === "anticipo" && (
              <span>¿Seguro que deseas marcar esta factura como <b>anticipada por banco</b>?</span>
            )}
            {confirmDialog.type === "reject" && (
              <span>¿Seguro que deseas <b>rechazar</b> esta factura? El estado será "rejected".</span>
            )}
            {confirmDialog.type === "void" && (
              <span>¿Seguro que deseas <b>anular</b> esta factura? El estado será "voided".</span>
            )}
            {confirmDialog.type === "revertir" && (
              <span>¿Estás seguro de que deseas revertir esta factura a su estado inicial (emitida)?</span>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDialog({ open: false, type: undefined })} className="rounded-2xl">
              Cancelar
            </Button>
            <Button
              variant="default"
              className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold"
              onClick={() => {
                if (confirmDialog.type === "pagada" || confirmDialog.type === "anticipo") {
                  onChangeStatus(invoice.id, confirmDialog.type);
                  toast({
                    title: "Estado actualizado",
                    description: `Factura marcada como ${confirmDialog.type === "pagada" ? "pagada" : "anticipada"}.`,
                    duration: 1400,
                  });
                } else if (confirmDialog.type === "reject") {
                  onReject?.(invoice.id);
                  toast({
                    title: "Invoice rejected",
                    description: "Estado cambiado a rejected.",
                    duration: 1400,
                  });
                } else if (confirmDialog.type === "void") {
                  onCancel?.(invoice.id);
                  toast({
                    title: "Invoice voided",
                    description: "Estado cambiado a voided.",
                    duration: 1400,
                  });
                } else if (confirmDialog.type === "revertir") {
                  onRevertStatus(invoice.id);
                  toast({
                    title: "Revertido",
                    description: "Factura devuelta a estado emitida.",
                    duration: 1400,
                  });
                }
                setConfirmDialog({ open: false, type: undefined });
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceCard;
