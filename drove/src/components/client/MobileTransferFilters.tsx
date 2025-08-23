
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
  { value: "", label: "Todos los estados" },
  { value: TransferStatus.PENDINGPAID, label: "Pendiente Pago" },
  { value: TransferStatus.CREATED, label: "Creado" },
  { value: TransferStatus.ASSIGNED, label: "Asignado" },
  { value: TransferStatus.PICKED_UP, label: "Recogido" },
  { value: TransferStatus.IN_PROGRESS, label: "En Progreso" },
  { value: TransferStatus.REQUEST_FINISH, label: "Solicita Finalizar" },
  { value: TransferStatus.DELIVERED, label: "Entregado" },
  { value: TransferStatus.CANCELLED, label: "Cancelado" },
];

const MobileTransferFilters: React.FC<Props> = ({
  search, setSearch, status, setStatus, dateRange, setDateRange,
}) => {
  function onDateSelect(range: DateRange | undefined) {
    setDateRange(range);
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      {/* Buscador - completamente centrado */}
      <div className="w-full">
        <Input
          placeholder="Buscar por ciudad, matrícula..."
          className="w-full h-12 bg-white/30 placeholder:text-white/70 border-0 text-white text-base rounded-2xl focus:ring-2 focus:ring-[#6EF7FF] font-medium"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtros en línea - completamente centrados */}
      <div className="flex gap-3 w-full">
        {/* Selector de estado */}
        <div className="flex-1">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full h-12 rounded-2xl px-4 bg-[#1A1F2C] text-white border border-white/10 text-base font-medium">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
              <SelectGroup>
                {estados.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Selector de fechas */}
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="w-full h-12 bg-white/30 text-white font-medium rounded-2xl gap-2 border-0 justify-start text-base px-4 hover:bg-white/40"
                variant="secondary"
              >
                <Calendar size={20} />
                <span className="truncate text-sm">
                  {dateRange?.from && dateRange?.to ? 
                    `${format(dateRange.from, "dd/MM", { locale: es })} - ${format(dateRange.to, "dd/MM", { locale: es })}` 
                    : "Fechas"
                  }
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-[#22142A] border-0 w-auto" align="end">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={onDateSelect}
                locale={es}
                initialFocus
                numberOfMonths={1}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default MobileTransferFilters;
