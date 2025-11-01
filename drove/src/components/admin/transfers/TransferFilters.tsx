
import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from 'react-day-picker';
import { TransferStatus } from "@/services/api/types/transfers";

interface TransferFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateRange: { from?: Date, to?: Date };
  setDateRange: (range: { from?: Date, to?: Date }) => void;
  pendingOnly?: boolean;
  setPendingOnly?: (value: boolean) => void;
}

const TransferFilters: React.FC<TransferFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  pendingOnly,
  setPendingOnly
}) => {
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: es })}`
    : 'Seleccionar fechas';

  // Mejor UX: usar rango temporal y aplicar con botón, no buscar en cada click
  const [open, setOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(() => {
    return (dateRange?.from || dateRange?.to) ? { from: dateRange.from, to: dateRange.to } : undefined;
  });

  const handleOpenChange = (v: boolean) => {
    // Al abrir, sincroniza el tempRange con el valor actual
    if (v) setTempRange((dateRange?.from || dateRange?.to) ? { from: dateRange.from, to: dateRange.to } : undefined);
    setOpen(v);
  };

  const applyRange = () => {
    if (tempRange) setDateRange({ from: tempRange.from, to: tempRange.to }); else setDateRange({});
    setOpen(false);
  };

  const clearRange = () => {
    setTempRange(undefined);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 mb-8">
      <div className="flex flex-col items-start md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-white w-full text-center lg:text-left">Listado de Traslados</h2>

        <div className="flex flex-col lg:flex-row gap-3 w-full">
          <div className="relative lg:w-1/3 flex items-center">
            <span className="absolute left-3 inset-y-0 flex items-center pointer-events-none h-full">
              <Search className="h-5 w-5 text-white/50" />
            </span>
            <Input
              placeholder="Buscar traslados..."
              className="pl-10 bg-white/5 border-white/10 text-white h-10 focus-visible:ring-2 focus-visible:ring-[#6EF7FF]/50 focus-visible:border-[#6EF7FF]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontFamily: "Helvetica" }}
            />
          </div>

          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-[#6EF7FF]/50 focus:border-[#6EF7FF]/50 lg:w-1/3">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-[#22142A] border-white/10 z-50">
              <SelectGroup>
                <SelectItem value="todos" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Todos los estados</SelectItem>
                <SelectItem value={TransferStatus.PENDINGPAID} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Pendiente Pago</SelectItem>
                <SelectItem value={TransferStatus.CREATED} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Creado</SelectItem>
                <SelectItem value={TransferStatus.ASSIGNED} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Asignado</SelectItem>
                <SelectItem value={TransferStatus.PICKED_UP} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Recogido</SelectItem>
                <SelectItem value={TransferStatus.IN_PROGRESS} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">En Progreso</SelectItem>
                <SelectItem value={TransferStatus.REQUEST_FINISH} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Solicita Finalizar</SelectItem>
                <SelectItem value={TransferStatus.DELIVERED} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Entregado</SelectItem>
                <SelectItem value={TransferStatus.CANCELLED} className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">Cancelado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 h-10 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6EF7FF]/50 lg:w-1/3">
                <Calendar className="h-4 w-4 text-[#6EF7FF]" />
                <span>{dateRangeText}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#22142A] border-white/10" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={tempRange?.from || dateRange?.from}
                selected={tempRange}
                onSelect={setTempRange}
                numberOfMonths={2}
                locale={es}
                className="bg-[#22142A] text-white pointer-events-auto"
              />
              <div className="flex items-center justify-between gap-2 p-2 border-t border-white/10">
                <button onClick={clearRange} className="text-xs text-white/70 hover:text-white px-2 py-1">Limpiar</button>
                <div className="flex gap-2">
                  <button onClick={() => setOpen(false)} className="text-xs px-3 py-1 rounded-2xl bg-white/10 text-white hover:bg-white/20">Cancelar</button>
                  <button onClick={applyRange} className="text-xs px-3 py-1 rounded-2xl bg-[#6EF7FF] text-[#22142A] font-bold hover:opacity-90">Aplicar</button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-2 text-white/80 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-white/20 bg-white/5"
          checked={!!pendingOnly}
          onChange={(e) => setPendingOnly?.(e.target.checked)}
        />
        <span>Solo traslados pendientes de acción</span>
      </div>
    </div>
  );
};

export default TransferFilters;
