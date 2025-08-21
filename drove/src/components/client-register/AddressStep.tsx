
import React from 'react';
import { MapPin } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { type ClientRegistrationData } from '@/types/client-registration';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddressStepProps {
  form: UseFormReturn<ClientRegistrationData>;
}

const AddressStep = ({ form }: AddressStepProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="pais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="España">España</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
                <SelectItem value="Francia">Francia</SelectItem>
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
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  placeholder="Calle, número, piso..." 
                  className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ciudad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ciudad" 
                  className="bg-white text-gray-900 placeholder:text-gray-400"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provincia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincia</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Provincia" 
                  className="bg-white text-gray-900 placeholder:text-gray-400"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="codigoPostal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código Postal</FormLabel>
            <FormControl>
              <Input 
                placeholder="28001" 
                className="bg-white text-gray-900 placeholder:text-gray-400"
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
