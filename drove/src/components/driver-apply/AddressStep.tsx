
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DriverApplicationData } from '@/types/driver-application';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface AddressStepProps {
  form: UseFormReturn<DriverApplicationData>;
}

const AddressStep: React.FC<AddressStepProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="pais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger 
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    field.value ? "text-black" : "text-muted-foreground"
                  )}
                >
                  <SelectValue placeholder="Selecciona tu país">
                    {field.value || "Selecciona tu país"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="españa">España</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="direccion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección completa</FormLabel>
            <FormControl>
              <Input 
                placeholder="Introduce tu dirección completa" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ciudad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad</FormLabel>
            <FormControl>
              <Input 
                placeholder="Introduce tu ciudad" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Región / Provincia</FormLabel>
            <FormControl>
              <Input 
                placeholder="Introduce tu región o provincia" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="codigoPostal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código postal</FormLabel>
            <FormControl>
              <Input 
                placeholder="Introduce tu código postal" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AddressStep;
