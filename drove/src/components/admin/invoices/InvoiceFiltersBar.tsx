
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
  dateRange: {from?: Date, to?: Date};
  setDateRange: (value: {from?: Date, to?: Date}) => void;
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
    <>
      <div className="w-full mb-2">
        <div className="flex flex-1 items-center gap-2 bg-[#1A1F2C] rounded-2xl px-3 py-2 md:mb-1">
          <Search className="text-[#6EF7FF] w-5 h-5" />
          <Input
            className="bg-transparent border-0 shadow-none text-base placeholder-white/40 p-0 pl-1"
            style={{ fontFamily: "Helvetica" }}
            placeholder="Buscar por cliente, drover, traslado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full mb-5 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end">
        {/* Estado de factura */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Estado Factura" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Estado de traslado */}
        <Select value={filterTransfer} onValueChange={setFilterTransfer}>
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Estado Traslado" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              {TRANSFER_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Cliente - ahora Combobox */}
        <ClientComboBox
          value={filterClient}
          options={clients.filter(cl => cl && cl !== "")}
          onValueChange={setFilterClient}
        />
        {/* Drover */}
        <Select value={filterDrover} onValueChange={setFilterDrover}>
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Drover" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todos">Todos los drovers</SelectItem>
              {drovers.filter(dr => dr && dr !== "").map(dr =>
                <SelectItem value={dr} key={dr}>{dr}</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Rango de fechas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="rounded-2xl bg-[#1A1F2C] text-white font-bold flex items-center gap-2 border-white/10"
            >
              <CalendarDays size={16} className="text-[#6EF7FF]" />
              <span>{rangeLabel}</span>
              <ChevronDown size={16} />
              {(dateRange?.from && dateRange?.to) && (
                <span className="ml-1 flex items-center text-white/60 group">
                  <button
                    type="button"
                    className="cursor-pointer hover:text-[#6EF7FF]"
                    title="Limpiar filtro"
                    onClick={e => { e.stopPropagation(); setDateRange({}); }}
                  >
                    <X size={15} />
                  </button>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-[#22142A] border-white/10 z-40">
            {/* date range picker */}
            <div className="p-2 flex flex-col gap-2">
              <Input
                type="date"
                value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                onChange={e => {
                  const d = e.target.value ? new Date(e.target.value) : undefined;
                  if (!d) return;
                  if (!dateRange?.to || (dateRange.to && d > dateRange.to)) {
                    return setDateRange({ from: d, to: d });
                  }
                  setDateRange({ from: d, to: dateRange.to });
                }}
                className="mb-2"
              />
              <Input
                type="date"
                value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                onChange={e => {
                  const d = e.target.value ? new Date(e.target.value) : undefined;
                  if (!d) return;
                  if (!dateRange?.from || (dateRange.from && d < dateRange.from)) {
                    return setDateRange({ from: d, to: d });
                  }
                  setDateRange({ from: dateRange.from, to: d });
                }}
              />
              {/* Botón limpiar filtro visible siempre que haya valores */}
              {(dateRange?.from || dateRange?.to) && (
                <Button
                  variant="ghost"
                  className="w-full mt-2 rounded-2xl text-white font-bold border border-[#6EF7FF]/10 hover:bg-[#6EF7FF]/15"
                  onClick={() => setDateRange({})}
                >
                  <X size={15} className="mr-2" /> Limpiar filtro
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
