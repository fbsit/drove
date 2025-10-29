import { Car, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import BrandSelector from './brand-selector/BrandSelector';
import ModelSelector from './model-selector/ModelSelector';
import YearSelector from './year-selector/YearSelector';
import vincarioService, { VincarioValidationState } from '@/services/vincarioService';

interface VehicleDetailsStepProps {
  form: UseFormReturn<VehicleTransferFormData>;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ form }) => {
  const vehicleDetails = form.watch("vehicleDetails") || {};
  const licensePlateValue = vehicleDetails.licensePlate || "";
  const vinValue = vehicleDetails.vin || "";

  // Estado para validación VIN
  const [vinState, setVinState] = useState<VincarioValidationState>({
    vinValidated: false,
    vinData: null,
    validating: false,
    cooldownUntil: null,
    error: null
  });

  // Efecto para actualizar cooldown
  useEffect(() => {
    if (vinState.cooldownUntil) {
      const interval = setInterval(() => {
        const remaining = vincarioService.getCooldownRemaining(vinState.cooldownUntil);
        if (remaining <= 0) {
          setVinState(prev => ({ ...prev, cooldownUntil: null }));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [vinState.cooldownUntil]);

  // Función para validar VIN
  const handleValidateVin = async () => {
    if (!vinValue || vinValue.length !== 17) {
      setVinState(prev => ({ 
        ...prev, 
        error: 'VIN debe tener 17 caracteres',
        validating: false 
      }));
      return;
    }

    if (!vincarioService.validateVinFormat(vinValue)) {
      setVinState(prev => ({ 
        ...prev, 
        error: 'VIN inválido. No debe contener I, O, Q',
        validating: false 
      }));
      return;
    }

    setVinState(prev => ({ ...prev, validating: true, error: null }));

    try {
      const result = await vincarioService.validateVin(vinValue);
      
      if (result.success && result.data) {
        // Actualizar formulario con datos de Vincario
        form.setValue("vehicleDetails.brand", result.data.make);
        form.setValue("vehicleDetails.model", result.data.model);
        form.setValue("vehicleDetails.year", result.data.year);
        form.setValue("vehicleDetails.vinValidated", true);
        
        setVinState({
          vinValidated: true,
          vinData: result.data,
          validating: false,
          cooldownUntil: null,
          error: null
        });
      } else {
        // Error de validación - activar cooldown de 30 segundos
        const cooldownUntil = new Date(Date.now() + 30000);
        setVinState({
          vinValidated: false,
          vinData: null,
          validating: false,
          cooldownUntil,
          error: result.error || 'Error al validar VIN'
        });
      }
    } catch (error) {
      const cooldownUntil = new Date(Date.now() + 30000);
      setVinState({
        vinValidated: false,
        vinData: null,
        validating: false,
        cooldownUntil,
        error: 'Error de conexión. Intenta nuevamente'
      });
    }
  };

  // Función para resetear validación cuando cambia el VIN
  const handleVinChange = (value: string) => {
    form.setValue("vehicleDetails.vin", value);
    if (vinState.vinValidated) {
      setVinState({
        vinValidated: false,
        vinData: null,
        validating: false,
        cooldownUntil: null,
        error: null
      });
      form.setValue("vehicleDetails.vinValidated", false);
    }
  };

  const cooldownRemaining = vincarioService.getCooldownRemaining(vinState.cooldownUntil);
  const canValidate = !vinState.validating && cooldownRemaining === 0 && vinValue.length === 17;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="text-white/60 text-sm mb-4">
        Selecciona el tipo de vehículo e ingresa el VIN para continuar
      </div>

      {/* Tipo de vehículo */}
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
                    // Resetear validación VIN si cambia el tipo
                    if (vinState.vinValidated) {
                      setVinState({
                        vinValidated: false,
                        vinData: null,
                        validating: false,
                        cooldownUntil: null,
                        error: null
                      });
                      form.setValue("vehicleDetails.vinValidated", false);
                    }
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
                    // Resetear validación VIN si cambia el tipo
                    if (vinState.vinValidated) {
                      setVinState({
                        vinValidated: false,
                        vinData: null,
                        validating: false,
                        cooldownUntil: null,
                        error: null
                      });
                      form.setValue("vehicleDetails.vinValidated", false);
                    }
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

      {/* VIN - Ahora es el segundo campo */}
      <FormField
        control={form.control}
        name="vehicleDetails.vin"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Nº de bastidor (VIN) *</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input
                  placeholder="17 caracteres alfanuméricos"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => handleVinChange(e.target.value.toUpperCase())}
                  maxLength={17}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleValidateVin}
                  disabled={!canValidate}
                  className="px-4 py-2 bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {vinState.validating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : cooldownRemaining > 0 ? (
                    vincarioService.formatCooldownTime(cooldownRemaining)
                  ) : (
                    'Validar VIN'
                  )}
                </Button>
              </div>
            </FormControl>
            <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1 text-left">
              <span className="text-white/60 text-sm flex-1">Sin caracteres I, O, Q</span>
              <span className={cn(
                "text-sm",
                (field.value?.length || 0) === 17 ? "text-green-500" : "text-white/60"
              )}>
                {(field.value?.length || 0)}/17 caracteres
              </span>
            </FormDescription>
            {vinState.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {vinState.error}
              </div>
            )}
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {/* Card con datos del vehículo validados */}
      {vinState.vinValidated && vinState.vinData && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-500 font-medium">VIN validado correctamente</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/60">Marca:</span>
                <div className="text-white font-medium">{vinState.vinData.make}</div>
              </div>
              <div>
                <span className="text-white/60">Modelo:</span>
                <div className="text-white font-medium">{vinState.vinData.model}</div>
              </div>
              <div>
                <span className="text-white/60">Año:</span>
                <div className="text-white font-medium">{vinState.vinData.year}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrícula (opcional) - Solo aparece después de validar VIN */}
      {vinState.vinValidated && (
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
                  className="w-full"
                />
              </FormControl>
              <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1 text-start">
                <span className="text-white/60 text-sm flex-1">Si aún no tiene, puedes dejarlo vacío. Formato: 1234ABC o ABC1234</span>
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
      )}
    </div>
  );
};

export default VehicleDetailsStep;
