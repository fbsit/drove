
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
      onChange(new Date(dateValue));
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
