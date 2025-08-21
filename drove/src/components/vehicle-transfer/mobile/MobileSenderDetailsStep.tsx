
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';

interface MobileSenderDetailsStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const MobileSenderDetailsStep: React.FC<MobileSenderDetailsStepProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      {/* Nombre completo */}
      <FormField
        control={form.control}
        name="senderDetails.fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Nombre completo
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Nombre y apellidos"
                className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF]"
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* DNI/NIE/CIF */}
      <FormField
        control={form.control}
        name="senderDetails.dni"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              DNI/NIE/CIF
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="12345678A / X1234567L / B12345678"
                className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF] uppercase"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={form.control}
        name="senderDetails.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Email
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="correo@ejemplo.com"
                className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF]"
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* Teléfono */}
      <FormField
        control={form.control}
        name="senderDetails.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Teléfono
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                placeholder="+34 600 000 000"
                className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF]"
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MobileSenderDetailsStep;
