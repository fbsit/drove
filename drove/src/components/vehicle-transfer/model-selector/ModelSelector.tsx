
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useEffect } from 'react';
import CarDataService, { CarModelDto } from '@/services/cardataService';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ModelSelectorProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const ModelSelector = ({ form }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const brand = form.watch("vehicleDetails.brand");
  const year = form.watch("vehicleDetails.year");
  const currentValue = form.watch("vehicleDetails.model");

  const [models, setModels] = React.useState<CarModelDto[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (!brand) { setModels([]); return; }
    (async () => {
      try {
        const data = await CarDataService.getModels(brand, year);
        if (isMounted) setModels(data);
      } catch {
        setModels([]);
      }
    })();
    return () => { isMounted = false; };
  }, [brand, year]);

  const normalizeText = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return (
    <FormField
      control={form.control}
      name="vehicleDetails.model"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-white font-medium">Modelo</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Seleccionar modelo..."
                  className="w-full max-w-full"
                />
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-[calc(100vw-2rem)] sm:w-auto p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar modelo..."
                    value={field.value}
                    onValueChange={(search) => {
                      field.onChange(search);
                    }}
                  />
                  <CommandList className="max-h-48 overflow-y-auto">
                    <CommandEmpty>No se encontraron modelos</CommandEmpty>
                    <CommandGroup>
                      {models
                        .map(m => m.name)
                        .filter(model => normalizeText(model).includes(normalizeText(field.value || "")))
                        .map(model => (
                          <CommandItem
                            key={model}
                            value={model}
                            onSelect={() => {
                              field.onChange(model);
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                currentValue === model ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{model}</span>
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

export default ModelSelector;
