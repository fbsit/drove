
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VehicleTransferRequest } from '@/types/vehicle-transfer-request';
import { vehicleBrands, getValidYears } from '@/data/vehicle-brands';
import ModelSelector from '@/components/vehicle-transfer/model-selector/ModelSelector';
import { Car, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import vincarioService, { VincarioValidationState } from '@/services/vincarioService';

interface MobileVehicleDetailsStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const MobileVehicleDetailsStep: React.FC<MobileVehicleDetailsStepProps> = ({ form }) => {
  const validYears = getValidYears();
  const selectedYear = form.watch("vehicleDetails.year");
  const selectedBrand = form.watch("vehicleDetails.brand");
  const vinValue = form.watch("vehicleDetails.vin") || "";

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
        console.log(`[VIN_VALIDATION_MOBILE] Datos recibidos de Vincario:`, result.data);
        
        // Actualizar formulario con datos de Vincario
        form.setValue("vehicleDetails.brand", result.data.make);
        form.setValue("vehicleDetails.model", result.data.model);
        form.setValue("vehicleDetails.year", result.data.year);
        form.setValue("vehicleDetails.vinValidated", true);
        
        console.log(`[VIN_VALIDATION_MOBILE] Formulario actualizado con:`, {
          brand: result.data.make,
          model: result.data.model,
          year: result.data.year
        });
        
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
                  onClick={() => {
                    field.onChange('coche');
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
                  onClick={() => {
                    field.onChange('camioneta');
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

      {/* VIN - Ahora es el segundo campo */}
      <FormField
        control={form.control}
        name="vehicleDetails.vin"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white text-sm font-medium">
              Número de bastidor (VIN) *
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Input
                  placeholder="17 caracteres alfanuméricos"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => handleVinChange(e.target.value.toUpperCase())}
                  maxLength={17}
                  className="h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:ring-2 focus:ring-[#6EF7FF] uppercase"
                />
                <Button
                  type="button"
                  onClick={handleValidateVin}
                  disabled={!canValidate}
                  className="w-full h-12 rounded-2xl bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {vinState.validating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validando...
                    </div>
                  ) : cooldownRemaining > 0 ? (
                    `Intenta en ${vincarioService.formatCooldownTime(cooldownRemaining)}`
                  ) : (
                    'Validar VIN'
                  )}
                </Button>
              </div>
            </FormControl>
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
              <span className="text-green-500 font-medium text-sm">VIN validado correctamente</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Marca:</span>
                <span className="text-white font-medium">{vinState.vinData.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Modelo:</span>
                <span className="text-white font-medium">{vinState.vinData.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Año:</span>
                <span className="text-white font-medium">{vinState.vinData.year}</span>
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
              <FormLabel className="text-white text-sm font-medium">
                Matrícula (opcional)
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
      )}
    </div>
  );
};

export default MobileVehicleDetailsStep;
