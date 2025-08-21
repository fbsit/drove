
import React from 'react';
import { Mail, Phone } from 'lucide-react';
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

interface ClientTypeStepProps {
  form: UseFormReturn<ClientRegistrationData>;
  isCompletingProfile?: boolean;
}

const ClientTypeStep = ({ form, isCompletingProfile = false }: ClientTypeStepProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form?.control}
        name="tipoCliente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Eres empresa o particular?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Selecciona el tipo de cliente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="persona">Particular</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form?.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  type="email"
                  placeholder="usuario@ejemplo.com" 
                  className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                  disabled={isCompletingProfile} // Disable if completing profile
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4">
        <FormField
          control={form?.control}
          name="codigoPais"
          render={({ field }) => (
            <FormItem className="w-32">
              <FormLabel>Código</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="País" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="+34">+34</SelectItem>
                  <SelectItem value="+351">+351</SelectItem>
                  <SelectItem value="+33">+33</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form?.control}
          name="telefono"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input 
                    type="tel"
                    placeholder="600 123 456" 
                    className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                    disabled={isCompletingProfile} // Disable if completing profile
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ClientTypeStep;
