import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LatLngCity } from '@/types/lat-lng-city';

interface VehicleTransferData {
  pickupDate: Date | undefined;
  pickupTime: string;
  pickupAddress: LatLngCity | undefined;
  deliveryAddress: LatLngCity | undefined;
}

interface Props {
  data: VehicleTransferData;
  onDataChange: (data: Partial<VehicleTransferData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MobilePickupDetailsStep: React.FC<Props> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
}) => {
  const [pickupAddress, setPickupAddress] = useState(
    data.pickupAddress?.address || data.pickupAddress?.city || '',
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    data.deliveryAddress?.address || data.deliveryAddress?.city || '',
  );
  const [isPickupCalendarOpen, setIsPickupCalendarOpen] = useState(false);

  /* handlers */
  const handlePickupAddressChange = useCallback(
    (value: string) => {
      setPickupAddress(value);
      onDataChange({
        pickupAddress: { city: value, lat: 0, lng: 0, address: value },
      });
    },
    [onDataChange],
  );

  const handleDeliveryAddressChange = useCallback(
    (value: string) => {
      setDeliveryAddress(value);
      onDataChange({
        deliveryAddress: { city: value, lat: 0, lng: 0, address: value },
      });
    },
    [onDataChange],
  );

  const handlePickupDateSelect = useCallback(
    (date: Date | undefined) => {
      onDataChange({ pickupDate: date });
      setIsPickupCalendarOpen(false);
    },
    [onDataChange],
  );

  const handlePickupTimeChange = useCallback(
    (time: string) => onDataChange({ pickupTime: time }),
    [onDataChange],
  );

  const isFormValid = () =>
    data.pickupDate &&
    data.pickupTime &&
    pickupAddress.trim() &&
    deliveryAddress.trim();

  /* UI */
  return (
    <div className="space-y-6">
      {/* encabezado */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-50 mb-2">Detalles de Recogida</h2>
        <p className="text-gray-400 text-sm">
          Especifica cuándo y dónde recoger el vehículo
        </p>
      </div>

      {/* fecha */}
      <div className="space-y-2">
        <Label className="text-gray-300">Fecha de Recogida *</Label>
        <Popover open={isPickupCalendarOpen} onOpenChange={setIsPickupCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal bg-gray-800/80 border-gray-700 text-gray-50 hover:bg-gray-700/60',
                !data.pickupDate && 'text-gray-400',
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4 text-sky-400" />
              {data.pickupDate ? format(data.pickupDate, 'PPP') : 'Seleccionar fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={data.pickupDate}
              onSelect={handlePickupDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* hora */}
      <div className="space-y-2">
        <Label htmlFor="pickupTime" className="text-gray-300">
          Hora de Recogida *
        </Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
          <Input
            id="pickupTime"
            type="time"
            value={data.pickupTime}
            onChange={(e) => handlePickupTimeChange(e.target.value)}
            className="pl-10 bg-gray-800/80 border-gray-700 text-gray-50 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* dirección recogida */}
      <div className="space-y-2">
        <Label htmlFor="pickupAddress" className="text-gray-300">
          Dirección de Recogida *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
          <Input
            id="pickupAddress"
            type="text"
            placeholder="Ej: Calle Mayor 123, Madrid"
            value={pickupAddress}
            onChange={(e) => handlePickupAddressChange(e.target.value)}
            className="pl-10 bg-gray-800/80 border-gray-700 text-gray-50 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* dirección entrega */}
      <div className="space-y-2">
        <Label htmlFor="deliveryAddress" className="text-gray-300">
          Dirección de Entrega *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
          <Input
            id="deliveryAddress"
            type="text"
            placeholder="Ej: Aeropuerto Barajas T4, Madrid"
            value={deliveryAddress}
            onChange={(e) => handleDeliveryAddressChange(e.target.value)}
            className="pl-10 bg-gray-800/80 border-gray-700 text-gray-50 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* botones */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className="w-full bg-sky-400 hover:bg-sky-500 text-gray-900 font-bold disabled:opacity-50"
        >
          Continuar
        </Button>

        <Button
          variant="outline"
          onClick={onPrevious}
          className="w-full border-gray-700 text-gray-50 hover:bg-gray-700/60"
        >
          Anterior
        </Button>
      </div>
    </div>
  );
};

export default MobilePickupDetailsStep;
