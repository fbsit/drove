
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import AddressInput from './AddressInput';
import SimpleDatePicker from './SimpleDatePicker';
import RouteDisplay from './route/RouteDisplay';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';
import { Input } from '@/components/ui/input';
import { LatLngCity } from '@/types/lat-lng-city';

interface PickupDetailsStepProps {
  form: UseFormReturn<VehicleTransferFormData>;
  onNext?: () => void;
  onPrev?: () => void;
}

export const PickupDetailsStep: React.FC<PickupDetailsStepProps> = ({
  form,
  onNext,
  onPrev
}) => {
  const { watch, setValue } = form;
  const pickupDetails = watch('pickupDetails') || {};

  const handleOriginChange = (value: LatLngCity) => {
    setValue('pickupDetails', {
      ...pickupDetails,
      originAddress: value
    });
  };

  const handleDestinationChange = (value: LatLngCity) => {
    setValue('pickupDetails', {
      ...pickupDetails,
      destinationAddress: value
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white">Detalles de Recogida y Entrega</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <FormField
            control={form.control}
            name="pickupDetails.originAddress"
            render={() => (
              <FormItem>
                <FormLabel>Dirección de Recogida</FormLabel>
                <FormControl>
                  <AddressInput
                    value={pickupDetails.originAddress || { address: '', city: '', lat: 0, lng: 0 }}
                    onChange={handleOriginChange}
                    placeholder="Introduce la dirección de recogida"
                    id="origin-address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pickupDetails.destinationAddress"
            render={() => (
              <FormItem>
                <FormLabel>Dirección de Entrega</FormLabel>
                <FormControl>
                  <AddressInput
                    value={pickupDetails.destinationAddress || { address: '', city: '', lat: 0, lng: 0 }}
                    onChange={handleDestinationChange}
                    placeholder="Introduce la dirección de entrega"
                    id="destination-address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {pickupDetails.originAddress && pickupDetails.destinationAddress && (
          <RouteDisplay
            form={form}
            originAddress={pickupDetails.originAddress}
            destinationAddress={pickupDetails.destinationAddress}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="pickupDetails.pickupDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Fecha de Recogida</FormLabel>
                <FormControl>
                  <SimpleDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    id="pickup-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pickupDetails.pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Hora de Recogida</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {onNext && onPrev && (
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev}>
              Anterior
            </Button>
            <Button type="button" onClick={onNext}>
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PickupDetailsStep;
