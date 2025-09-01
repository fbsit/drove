
import React from 'react';
import { Calendar } from "lucide-react";
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  clientType: string;
  setClientType: (type: string) => void;
  onDatePresetSelect: (preset: 'thisMonth' | 'lastMonth' | 'last3Months') => void;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  dateRange,
  setDateRange,
  clientType,
  setClientType,
  onDatePresetSelect
}) => {
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: es })}`
    : 'Seleccionar periodo';

  return (
    <div className="bg-white/10 rounded-2xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-xl font-bold text-white">Filtros</h2>

        <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-fit">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white hover:bg-white/10 transition-colors">
                <Calendar className="h-4 w-4 text-[#6EF7FF]" />
                <span>{dateRangeText}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#22142A] border-white/10" align="end">
              <div className="p-3 border-b border-white/10 flex justify-between">
                <button
                  className="text-sm text-[#6EF7FF] hover:underline"
                  onClick={() => onDatePresetSelect('thisMonth')}
                >
                  Este mes
                </button>
                <button
                  className="text-sm text-[#6EF7FF] hover:underline"
                  onClick={() => onDatePresetSelect('lastMonth')}
                >
                  Mes anterior
                </button>
                <button
                  className="text-sm text-[#6EF7FF] hover:underline"
                  onClick={() => onDatePresetSelect('last3Months')}
                >
                  Últimos 3 meses
                </button>
              </div>
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
                className="bg-[#22142A] text-white"
              />
            </PopoverContent>
          </Popover>

          <Select value={clientType} onValueChange={setClientType}>
            <SelectTrigger className="w-full lg:w-[200px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Tipo de cliente" />
            </SelectTrigger>
            <SelectContent className="bg-[#22142A] border-white/10">
              <SelectGroup>
                <SelectLabel className="text-white/70">Tipo de cliente</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="client">Individuales</SelectItem>
                <SelectItem value="company">Empresas</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
