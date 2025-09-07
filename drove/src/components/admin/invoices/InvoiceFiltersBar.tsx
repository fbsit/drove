
import React from "react";
import { CalendarDays, Filter, Search, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ClientComboBox from "./ClientComboBox";

interface InvoiceFiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterTransfer: string;
  setFilterTransfer: (value: string) => void;
  filterClient: string;
  setFilterClient: (value: string) => void;
  filterDrover: string;
  setFilterDrover: (value: string) => void;
  dateRange: { from?: Date, to?: Date };
  setDateRange: (value: { from?: Date, to?: Date }) => void;
  clients: string[];
  drovers: string[];
}

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos los estados" },
  { value: "emitida", label: "Emitida" },
  { value: "anticipo", label: "Anticipada" },
  { value: "pagada", label: "Pagada" },
];
const TRANSFER_OPTIONS = [
  { value: "todos", label: "Todos los traslados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function InvoiceFiltersBar({
  search, setSearch,
  filterStatus, setFilterStatus,
  filterTransfer, setFilterTransfer,
  filterClient, setFilterClient,
  filterDrover, setFilterDrover,
  dateRange, setDateRange,
  clients, drovers
}: InvoiceFiltersBarProps) {
  const rangeLabel = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: es })}`
    : "Rango de fechas";

  return (
    <div className="bg-transparent mb-4">
      {/* Buscador superior */}
      <div className="w-full mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6EF7FF] w-4 h-4" />
          <Input
            className="pl-9 h-11 rounded-2xl bg-[#12141B]/80 border border-white/10 text-white placeholder-white/40 shadow-inner"
            style={{ fontFamily: "Helvetica" }}
            placeholder="Buscar por cliente, drover, traslado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Checkbox línea */}
      <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
        <input type="checkbox" className="h-4 w-4 rounded border-white/20" />
        <span>Solo acciones pendientes</span>
      </div>

      {/* Fila de chips (filtros pill) */}
      <div className="flex gap-x-[2%] gap-3 xl:gap-x-3 flex-wrap xl:flex-nowrap justify-center">
        {/* Estado de factura */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-10 rounded-2xl bg-[#1B1E28] text-white border-white/10 justify-between w-full md:w-[49%] xl:w-full">
            <div className="flex items-center gap-2"><span className="text-white/70">Todos los estados</span></div>

          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Estado de traslado (placeholder) */}
        <Select value={filterTransfer} onValueChange={setFilterTransfer}>
          <SelectTrigger className="h-10 rounded-2xl bg-[#1B1E28] text-white border-white/10 w-full md:w-[49%] xl:w-full justify-between">
            <div className="flex items-center gap-2"><span className="text-white/70">Todos los traslados</span></div>

          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              {TRANSFER_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Cliente combobox */}
        <ClientComboBox value={filterClient} options={clients || []} onValueChange={setFilterClient} />

        {/* Drover (placeholder) */}
        <Select value={filterDrover} onValueChange={setFilterDrover}>
          <SelectTrigger className="h-10 rounded-2xl bg-[#1B1E28] text-white border-white/10 w-full md:w-[49%] xl:w-full justify-between">
            <div className="flex items-center gap-2"><span className="text-white/70">Todos los drovers</span></div>

          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Rango de fechas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-10 rounded-2xl bg-[#1B1E28] text-white border-white/10 px-4 flex items-center gap-2 w-full md:w-[49%] xl:w-full justify-between"
            >
              <CalendarDays size={16} className="text-[#6EF7FF]" />
              <span>Rango de fechas</span>

            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-[#22142A] text-white border-white/10 rounded-2xl w-fit">
            <div className="p-2 flex items-center gap-2">
              <Input
                type="date"
                className="rounded-xl bg-[#1A1F2C] text-white border-white/10"
                value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                onChange={e => setDateRange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
              />
              <span className="text-white/50">—</span>
              <Input
                type="date"
                className="rounded-xl bg-[#1A1F2C] text-white border-white/10"
                value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                onChange={e => setDateRange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
