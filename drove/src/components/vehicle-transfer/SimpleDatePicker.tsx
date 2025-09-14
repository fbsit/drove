
import React from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

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
      // Avoid timezone shifts when parsing "yyyy-MM-dd" by constructing
      // a local Date at noon instead of relying on UTC parsing of the string.
      // Example: "2025-09-14" -> new Date(2025, 8, 14, 12, 0, 0)
      const [yearStr, monthStr, dayStr] = dateValue.split('-');
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1; // 0-based
      const day = Number(dayStr);
      const safeLocalDate = new Date(year, monthIndex, day, 12, 0, 0, 0);
      onChange(safeLocalDate);
    } else {
      onChange(undefined);
    }
  };

  const formattedValue = value ? format(value, 'yyyy-MM-dd') : '';

  return (
    <Input
      id={id}
      type="date"
      value={formattedValue}
      onChange={handleDateChange}
      className="w-full"
    />
  );
};

export default SimpleDatePicker;
