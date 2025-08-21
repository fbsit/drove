
import React from "react";
import { Search, Filter, Calendar, ChevronDown, X, CreditCard, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectValue, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BillingFiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  filterInvoiceStatus: string;
  setFilterInvoiceStatus: (value: string) => void;
  filterPaymentMethod: string;
  setFilterPaymentMethod: (value: string) => void;
  filterTransferStatus: string;
  setFilterTransferStatus: (value: string) => void;
  dateRange: {from?: Date, to?: Date};
  setDateRange: (value: {from?: Date, to?: Date}) => void;
  clients: string[];
}

export default function BillingFiltersBar({
  search, setSearch,
  filterInvoiceStatus, setFilterInvoiceStatus,
  filterPaymentMethod, setFilterPaymentMethod,
  filterTransferStatus, setFilterTransferStatus,
  dateRange, setDateRange,
  clients
}: BillingFiltersBarProps) {
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
            placeholder="Buscar por cliente o traslado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full mb-5 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end">
        {/* Estado Factura */}
        <Select value={filterInvoiceStatus} onValueChange={setFilterInvoiceStatus}>
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Estado Factura" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="emitida">Emitida</SelectItem>
              <SelectItem value="no_emitida">No emitida</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Método de pago */}
        <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Método de Pago" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todas">Todos</SelectItem>
              <SelectItem value="tarjeta"><CreditCard size={15} className="inline mr-1 -mt-0.5" />Tarjeta</SelectItem>
              <SelectItem value="transferencia"><DollarSign size={15} className="inline mr-1 -mt-0.5" />Transferencia</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Estado traslado */}
        <Select value={filterTransferStatus} onValueChange={setFilterTransferStatus}>
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Estado Traslado" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="asignado">Asignado</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Cliente */}
        <Select value="">
          {/* Para simplificar, puedes reemplazar por un dropdown avanzado o combobox real */}
          <SelectTrigger className="rounded-2xl bg-[#1A1F2C] text-white border-white/10">
            <Filter size={14} className="mr-1" /> <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30" style={{ maxHeight: 250, overflowY: "auto" }}>
            <SelectGroup>
              <SelectItem value="todos">Todos</SelectItem>
              {clients?.filter(cl => cl && cl !== "").map(cl =>
                <SelectItem key={cl} value={cl}>{cl}</SelectItem>
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
              <Calendar size={16} className="text-[#6EF7FF]" />
              <span>{rangeLabel}</span>
              <ChevronDown size={16} />
              {(dateRange?.from && dateRange?.to) && (
                <span className="ml-1 flex items-center text-white/60 group">
                  <X size={15} className="cursor-pointer hover:text-[#6EF7FF]" onClick={e => { e.stopPropagation(); setDateRange({}); }} />
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
              {/* Botón limpiar filtro */}
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
