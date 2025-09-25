
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import { vehicleBrands, getValidYears } from '@/data/vehicle-brands';
import ModelSelector from '@/components/vehicle-transfer/model-selector/ModelSelector';
import { Car, Truck } from 'lucide-react';

interface MobileVehicleDetailsStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const MobileVehicleDetailsStep: React.FC<MobileVehicleDetailsStepProps> = ({ form }) => {
  const validYears = getValidYears();
  const selectedYear = form.watch("vehicleDetails.year");
  const selectedBrand = form.watch("vehicleDetails.brand");

  return (
    <div className="space-y-4">
      {/* Tipo de vehículo */}
      <FormField
        control={form.control}
        name="vehicleDetails.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Tipo de vehículo
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange('coche')}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${field.value === 'coche'
                      ? 'border-[#6EF7FF] bg-[#6EF7FF]/10 text-[#6EF7FF]'
                      : 'border-white/20 bg-white/5 text-white/70'
                    }`}
                >
                  <Car className="h-6 w-6" />
                  <div className="font-medium text-sm">Coche</div>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('camioneta')}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${field.value === 'camioneta'
                      ? 'border-[#6EF7FF] bg-[#6EF7FF]/10 text-[#6EF7FF]'
                      : 'border-white/20 bg-white/5 text-white/70'
                    }`}
                >
                  <Truck className="h-6 w-6" />
                  <div className="font-medium text-sm">Camioneta</div>
                </button>
              </div>
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* Marca */}
      <FormField
        control={form.control}
        name="vehicleDetails.brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Marca
            </FormLabel>
            <FormControl>
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  // Limpiar modelo cuando cambie la marca
                  form.setValue("vehicleDetails.model", "");
                }}
                className="w-full h-12 rounded-2xl px-4 bg-white/10 text-white border border-white/20 text-sm focus:ring-2 focus:ring-[#6EF7FF] focus:border-[#6EF7FF] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px'
                }}
              >
                <option value="" className="bg-[#22142A] text-white">
                  Selecciona una marca
                </option>
                {vehicleBrands.map((brand) => (
                  <option key={brand} value={brand} className="bg-[#22142A] text-white">
                    {brand}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* Año - AHORA VA ANTES DEL MODELO */}
      <FormField
        control={form.control}
        name="vehicleDetails.year"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Año
            </FormLabel>
            <FormControl>
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  // Limpiar modelo cuando cambie el año
                  form.setValue("vehicleDetails.model", "");
                }}
                className="w-full h-12 rounded-2xl px-4 bg-white/10 text-white border border-white/20 text-sm focus:ring-2 focus:ring-[#6EF7FF] focus:border-[#6EF7FF] appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px'
                }}
              >
                <option value="" className="bg-[#22142A] text-white">
                  Selecciona un año
                </option>
                {validYears.map((year) => (
                  <option key={year} value={year} className="bg-[#22142A] text-white">
                    {year}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* Modelo - AHORA DEPENDE DEL AÑO */}
      {selectedYear && selectedBrand && (
        <ModelSelector form={form} />
      )}

      {/* Campos que aparecen solo si hay modelo seleccionado */}
      {form.watch("vehicleDetails.model") && (
        <>
          {/* Matrícula */}
          <FormField
            control={form.control}
            name="vehicleDetails.licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium">
                  Matrícula
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="1234ABC o ABC1234"
                    className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF] uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
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
                <FormLabel className="text-white text-sm font-medium">
                  Número de bastidor (VIN)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="17 caracteres alfanuméricos"
                    className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF] uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default MobileVehicleDetailsStep;
