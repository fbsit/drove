import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import AddressInput from './AddressInput';
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

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.showPicker();
  };

  const handleTimeClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.showPicker();
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const parseDateFromInput = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white">Detalles de Recogida y Entrega</CardTitle>
      </CardHeader>
      <CardContent className="text-white/90 grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <FormField
          control={form.control}
          name="pickupDetails.pickupDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Fecha de Recogida
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  onClick={handleDateClick}
                  className="w-full cursor-pointer"
                  min={new Date().toISOString().split('T')[0]}
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
              <FormLabel className="text-white">
                Hora de Recogida
              </FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                  onClick={handleTimeClick}
                  className="w-full cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};