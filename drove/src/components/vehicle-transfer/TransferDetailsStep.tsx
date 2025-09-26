import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';

interface Props {
  form: UseFormReturn<VehicleTransferFormData>;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: (data: VehicleTransferFormData) => void;
}

const TransferDetailsStep: React.FC<Props> = ({
  form,
  onNext,
  onPrev,
  onSubmit,
}) => {

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loadingKm, setLoadingKm] = useState(false);
  const [amountTravel, setAmountTravel] = useState()


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit ? onSubmit(form.getValues()) : onNext?.();
  };

  /* estilos reutilizables */
  const input =
    'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500';

  return (
    <Card className="w-full max-w-3xl mx-auto border-none">
      {/* cabecera con color de marca */}
      <CardHeader className="rounded-t-lg">
        <CardTitle className="text-white text-center text-xl sm:text-2xl">
          Detalles del Traslado
        </CardTitle>
      </CardHeader>

      <CardContent className="text-white rounded-b-lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Remitente */}
          <fieldset>
            <legend className="font-semibold mb-4">
              Datos del Remitente
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="senderDetails.fullName"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">
                      Nombre completo
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderDetails.dni"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">DNI</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderDetails.email"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderDetails.phone"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </fieldset>

          {/* Destinatario */}
          <fieldset>
            <legend className="text-white font-semibold mb-4">
              Datos del Destinatario
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="receiverDetails.fullName"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">
                      Nombre completo
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverDetails.dni"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">DNI</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverDetails.email"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverDetails.phone"
                render={({ field }) => (
                  <FormItem className='bg-white/10 rounded-md p-4'>
                    <FormLabel className="text-white font-bold text-base">Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} bg-transparent text-white border-none text-center`} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </fieldset>


        </form>
        {distanceKm !== null && (
          <div className="text-right text-white">
            Distancia estimada:{' '}
            <span className="font-semibold">
              {loadingKm ? 'calculando…' : `${distanceKm.toFixed(1)} km`}
            </span>
            {/* ejemplo de precio simple */}
            <div className="text-sm text-gray-500">
              Precio estimado:{' '}
              <span className="font-semibold">
                {amountTravel} €
              </span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default TransferDetailsStep;
