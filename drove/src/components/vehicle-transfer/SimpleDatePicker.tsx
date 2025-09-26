import React from 'react';
import { Input } from '@/components/ui/input';
import { format, addYears } from 'date-fns';
import { Calendar } from 'lucide-react';

interface SimpleDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  id?: string;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,
  id
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const [yearStr, monthStr, dayStr] = dateValue.split('-');
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1;
      const day = Number(dayStr);
      const safeLocalDate = new Date(year, monthIndex, day, 12, 0, 0, 0);
      onChange(safeLocalDate);
    } else {
      onChange(undefined);
    }
  };

  const formattedValue = value ? format(value, 'yyyy-MM-dd') : '';

  // Limites: hoy como mínimo, 2 años adelante como máximo
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');
  const maxDate = format(addYears(today, 2), 'yyyy-MM-dd');

  return (
    <div className="relative max-w-xs w-full">
      <Input
        id={id}
        type="date"
        value={formattedValue}
        onChange={handleDateChange}
        className="w-full pr-10 custom-date-input"
        min={minDate}
        max={maxDate}
      />
      {/* Icono personalizado que abre el calendario */}
      <Calendar
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white cursor-pointer"
        onClick={() => {
          const input = document.getElementById(id || '') as HTMLInputElement | null;
          if (input && input.showPicker) {
            input.showPicker(); // abre el calendario nativo
          } else {
            input?.focus(); // fallback
          }
        }}
      />
    </div>
  );
};

export default SimpleDatePicker;
