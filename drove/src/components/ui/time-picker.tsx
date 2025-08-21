
import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TimePicker({
  value = "",
  onChange,
  disabled = false,
  className,
  id,
}: TimePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 text-gray-900 bg-white border-gray-300",
          className
        )}
        id={id}
      />
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2" color="#6EF7FF" />
    </div>
  );
}
