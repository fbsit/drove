
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import BrandSelector from './brand-selector/BrandSelector';
import ModelSelector from './model-selector/ModelSelector';
import YearSelector from './year-selector/YearSelector';

interface VehicleDetailsStepProps {
  form: UseFormReturn<VehicleTransferFormData>;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ form }) => {
  const vehicleDetails = form.watch("vehicleDetails") || {};
  const licensePlateValue = vehicleDetails.licensePlate || "";
  const vinValue = vehicleDetails.vin || "";

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="text-white/60 text-sm mb-4">
        Selecciona el tipo de vehículo, año y marca para continuar
      </div>

      <FormField
        control={form.control}
        name="vehicleDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Tipo de vehículo</FormLabel>
            <Select
              onValueChange={(value) => {
                const currentDetails = field.value || {};
                field.onChange({
                  ...currentDetails,
                  type: value,
                  year: "",
                  brand: "",
                  model: ""
                });
              }}
              defaultValue={(field.value as any)?.type || "coche"}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    "w-full max-w-full pl-3 text-left font-normal",
                    "bg-transparant text-white"
                  )}
                >
                  <SelectValue placeholder="Selecciona el tipo de vehículo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="coche">Coche</SelectItem>
                <SelectItem value="camioneta">Camioneta</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <YearSelector form={form} />

      {vehicleDetails.year && (
        <BrandSelector form={form} />
      )}

      {vehicleDetails.brand && (
        <ModelSelector form={form} />
      )}

      {vehicleDetails.model && (
        <div className="space-y-4 sm:space-y-6">
          {/* Matrícula */}
          <FormField
            control={form.control}
            name="vehicleDetails.licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Matrícula</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ejemplo: 1234ABC o ABC1234"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    maxLength={7}
                    className="w-full max-w-full"
                  />
                </FormControl>
                <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-white/60 text-sm">Formato: 1234ABC o ABC1234</span>
                  <span className={cn(
                    "text-sm",
                    (field.value?.length || 0) === 7 ? "text-green-500" : "text-white/60"
                  )}>
                    {(field.value?.length || 0)}/7 caracteres
                  </span>
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* VIN */}
          <FormField
            control={form.control}
            name="vehicleDetails.vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Nº de bastidor (VIN)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="17 caracteres alfanuméricos"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    maxLength={17}
                    className="w-full max-w-full"
                  />
                </FormControl>
                <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-white/60 text-sm">Sin caracteres I, O, Q</span>
                  <span className={cn(
                    "text-sm",
                    (field.value?.length || 0) === 17 ? "text-green-500" : "text-white/60"
                  )}>
                    {(field.value?.length || 0)}/17 caracteres
                  </span>
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsStep;
