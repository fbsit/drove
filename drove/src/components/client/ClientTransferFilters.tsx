
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

interface Props {
  search: string;
  setSearch: (str: string) => void;
  status: string;
  setStatus: (s: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (r: DateRange | undefined) => void;
}

const estados = [
  { value: "", label: "Todos" },
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

  function onDateSelect(range: DateRange | undefined) {
    setDateRange(range);
  }

  return (
    <div className="flex flex-col md:flex-row bg-white/10 rounded-2xl p-4 mb-6 gap-3">
      <Input
        placeholder="Buscar por ciudad, matrícula, modelo..."
        className="bg-white/30 placeholder:text-white/70 border-0 text-base font-montserrat focus:ring-2 focus:ring-[#6EF7FF]"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="rounded-2xl px-4 py-2 bg-white/30 text-white border-0 font-montserrat focus:ring-2 focus:ring-[#6EF7FF]"
      >
        {estados.map(opt =>
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
      <Popover>
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
            selected={dateRange}
            onSelect={onDateSelect}
            locale={es}
            initialFocus
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ClientTransferFilters;
