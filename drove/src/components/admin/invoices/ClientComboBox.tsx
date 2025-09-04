
import * as React from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";

interface ClientComboBoxProps {
  value: string;
  options: string[];
  onValueChange: (val: string) => void;
}

export default function ClientComboBox({ value, options, onValueChange }: ClientComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const displayValue = value === "todos" ? "" : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          className="rounded-2xl bg-[#1A1F2C] text-white font-normal border-white/10 w-[180px] justify-between"
        >
          <span className={displayValue ? "" : "text-white/40"}>
            {displayValue || "Cliente"}
          </span>
          <ChevronDown size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-[#22142A] p-0 border-white/10 z-30 w-[210px]">
        <Command>
          <CommandInput placeholder="Buscar cliente..." className="bg-transparent border-0 text-white placeholder-white/40" />
          <CommandList>
            <CommandItem
              value="todos"
              onSelect={() => {
                onValueChange("todos");
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              Todos los clientes
            </CommandItem>
            {options.map(opt => (
              <CommandItem
                key={opt}
                value={opt}
                onSelect={() => {
                  onValueChange(opt);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                {opt}
              </CommandItem>
            ))}
          </CommandList>
          <CommandEmpty>No se encontraron resultados</CommandEmpty>
        </Command>
        {displayValue && (
          <Button
            onClick={() => { onValueChange("todos"); setOpen(false); }}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 rounded-full text-white/60 px-2 py-0 h-7 w-7"
            title="Limpiar selección"
          >
            <X size={15} />
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
