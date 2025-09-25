
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SignatureSection from './signature/SignatureSection';

interface PaymentMethodStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
}

const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <FormItem>
                <Card className={`border cursor-pointer hover:border-[#6EF7FF]/50 transition-all ${field.value === 'card' ? 'border-[#6EF7FF] bg-[#6EF7FF]/10' : 'border-white/10 bg-white/5'}`}>
                  <CardContent className="p-6 flex gap-4 text-start">
                    <RadioGroupItem value="card" id="card" className="sr-only" />
                    <label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-[#6EF7FF]" />
                      <div>
                        <p className="text-sm font-medium leading-none mb-1 text-white">Tarjeta de crédito/débito</p>
                        <p className="text-xs text-white/50">Pago seguro con Stripe</p>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              </FormItem>

              <FormItem>
                <Card className={`border cursor-pointer hover:border-[#6EF7FF]/50 transition-all ${field.value === 'transfer' ? 'border-[#6EF7FF] bg-[#6EF7FF]/10' : 'border-white/10 bg-white/5'}`}>
                  <CardContent className="p-6 flex text-start gap-4">
                    <RadioGroupItem value="transfer" id="transfer" className="sr-only" />
                    <label htmlFor="transfer" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-[#6EF7FF]" />
                      <div>
                        <p className="text-sm font-medium leading-none mb-1 text-white">Transferencia bancaria</p>
                        <p className="text-xs text-white/50">Pendiente hasta confirmación</p>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              </FormItem>
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-6">
        <Card className="bg-white/10 border-white/10">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <span className="text-white">Total a pagar:</span>
              <span className="text-[#6EF7FF] font-bold text-lg">
                {form.watch("transferDetails.totalPrice")} €
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {form.watch("paymentMethod") === 'transfer' && (
        <div className="mt-4">
          <Alert className="bg-white/10 border-white/10">
            <AlertCircle className="h-4 w-4 text-[#6EF7FF]" />
            <AlertDescription className="text-white/70">
              Una vez confirmada la solicitud, recibirás un email con los datos bancarios para realizar la transferencia. Tu solicitud quedará pendiente hasta confirmar el pago.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Firma del solicitante */}
      <div className="mt-6">
        <SignatureSection
          form={form as any}
          onSignatureChange={(sig: string) => {
            form.setValue('transferDetails.signature', sig as any, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </div>
    </div>
  );
};

export default PaymentMethodStep;
