
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehicleBrands } from '@/data/vehicle-brands';
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';

interface BrandSelectorProps {
  form: UseFormReturn<VehicleTransferFormData>;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="vehicleDetails.brand"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white">Marca del Vehículo</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una marca" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {vehicleBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BrandSelector;
