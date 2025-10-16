import { Car, Truck } from 'lucide-react';
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
        name="vehicleDetails.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium text-sm sm:text-base">
              Tipo de vehículo
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Coche */}
                <button
                  type="button"
                  onClick={() => {
                    field.onChange("coche");
                    // resetear los otros campos si querés
                    form.setValue("vehicleDetails.year", "");
                    form.setValue("vehicleDetails.brand", "");
                    form.setValue("vehicleDetails.model", "");
                  }}
                  className={`p-2 rounded-2xl border-2 transition-all duration-200 flex justify-center items-center gap-2 w-full ${field.value === "coche"
                    ? "border-[#6EF7FF] bg-[#6EF7FF]/10 text-[#6EF7FF]"
                    : "border-white/20 bg-white/5 text-white/70"
                    }`}
                >
                  <Car className="h-6 w-6 sm:h-7 sm:w-7" />
                  <div className="font-medium text-sm sm:text-base">Coche</div>
                </button>

                {/* Camioneta */}
                <button
                  type="button"
                  onClick={() => {
                    field.onChange("camioneta");
                    form.setValue("vehicleDetails.year", "");
                    form.setValue("vehicleDetails.brand", "");
                    form.setValue("vehicleDetails.model", "");
                  }}
                  className={`p-2 rounded-2xl border-2 transition-all duration-200 flex justify-center items-center gap-2 w-full ${field.value === "camioneta"
                    ? "border-[#6EF7FF] bg-[#6EF7FF]/10 text-[#6EF7FF]"
                    : "border-white/20 bg-white/5 text-white/70"
                    }`}
                >
                  <Truck className="h-6 w-6 sm:h-7 sm:w-7" />
                  <div className="font-medium text-sm sm:text-base">Camioneta</div>
                </button>
              </div>
            </FormControl>
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
          {/* Matrícula (opcional) */}
          <FormField
            control={form.control}
            name="vehicleDetails.licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Matrícula (opcional)</FormLabel>
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
                  <span className="text-white/60 text-sm">Si aún no tiene, puedes dejarlo vacío. Formato: 1234ABC o ABC1234</span>
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
