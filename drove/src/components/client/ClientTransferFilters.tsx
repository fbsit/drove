
import React from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { TransferStatus } from "@/services/api/types/transfers";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

interface Props {
  search: string;
  setSearch: (str: string) => void;
  status: string;
  setStatus: (s: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (r: DateRange | undefined) => void;
}

const estados = [
  { value: "all", label: "Todos" },
  { value: TransferStatus.PENDINGPAID, label: "Pendiente Pago" },
  { value: TransferStatus.CREATED, label: "Creado" },
  { value: TransferStatus.ASSIGNED, label: "Asignado" },
  { value: TransferStatus.PICKED_UP, label: "Recogido" },
  { value: TransferStatus.IN_PROGRESS, label: "En Progreso" },
  { value: TransferStatus.REQUEST_FINISH, label: "Solicita Finalizar" },
  { value: TransferStatus.DELIVERED, label: "Entregado" },
  { value: TransferStatus.CANCELLED, label: "Cancelado" },
];

const ClientTransferFilters: React.FC<Props> = ({
  search, setSearch, status, setStatus, dateRange, setDateRange,
}) => {
  const dateText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "dd/MM/yy", { locale: es })} - ${format(dateRange.to, "dd/MM/yy", { locale: es })}`
    : "Seleccionar fechas";

  // Mejor UX: aplicar con botón, no onSelect inmediato
  const [open, setOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(() => dateRange);
  const onOpenChange = (v: boolean) => {
    if (v) setTempRange(dateRange);
    setOpen(v);
  };
  const apply = () => { setDateRange(tempRange); setOpen(false); };
  const clear = () => { setTempRange(undefined); };

  return (
    <div className="flex flex-col md:flex-row bg-white/10 rounded-2xl p-4 mb-6 gap-3">
      <Input
        placeholder="Buscar por ciudad, matrícula, modelo..."
        className="bg-white/30 placeholder:text-white/70 border-0 text-base font-montserrat focus:ring-2 focus:ring-[#6EF7FF]"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Select value={status || 'all'} onValueChange={val => setStatus(val === 'all' ? '' : val)}>
        <SelectTrigger className="rounded-2xl px-4 py-2 bg-[#1A1F2C] text-white border border-white/10 font-montserrat">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
          <SelectGroup>
            {estados.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className="bg-white/30 text-white font-montserrat rounded-2xl gap-2"
            variant="secondary"
          >
            <Calendar size={18} />
            {dateText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-[#22142A] border-0" align="start">
          <CalendarComponent
            mode="range"
            selected={tempRange}
            onSelect={setTempRange}
            locale={es}
            initialFocus
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <button onClick={clear} className="text-xs text-white/70 hover:text-white">Limpiar</button>
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="text-xs px-3 py-1 rounded-2xl bg-white/10 text-white hover:bg-white/20">Cancelar</button>
              <button onClick={apply} className="text-xs px-3 py-1 rounded-2xl bg-[#6EF7FF] text-[#22142A] font-bold hover:opacity-90">Aplicar</button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ClientTransferFilters;
