
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getValidYears } from '@/data/vehicle-brands';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface YearSelectorProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const YearSelector = ({ form }: YearSelectorProps) => {
  const [open, setOpen] = useState(false);
  const currentValue = form.watch("vehicleDetails.year");
  const years = getValidYears();

  return (
    <FormField
      control={form.control}
      name="vehicleDetails.year"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-white font-medium">Año del vehículo</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Seleccionar año..."
                  className="w-full max-w-full"
                />
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-[calc(100vw-2rem)] sm:w-auto p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar año..."
                    value={field.value}
                    onValueChange={(search) => {
                      field.onChange(search);
                    }}
                  />
                  <CommandList className="max-h-48 overflow-y-auto">
                    <CommandEmpty>No se encontraron años</CommandEmpty>
                    <CommandGroup>
                      {years
                        .filter(year => year.includes(field.value || ""))
                        .map(year => (
                          <CommandItem
                            key={year}
                            value={year}
                            onSelect={() => {
                              field.onChange(year);
                              form.setValue("vehicleDetails.brand", "");
                              form.setValue("vehicleDetails.model", "");
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                currentValue === year ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{year}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
};

export default YearSelector;
