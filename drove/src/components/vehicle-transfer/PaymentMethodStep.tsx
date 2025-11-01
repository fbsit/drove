
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="price-breakdown" className="border-white/10">
                <AccordionTrigger className="text-white hover:no-underline">
                  <div className="flex justify-between w-full pr-4 text-left">
                    <span>Total a pagar (IVA incluido)</span>
                    <span className="text-[#6EF7FF] font-bold text-lg">
                      {form.watch("transferDetails.totalPrice")}€
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Neto (sin IVA)</span>
                      <span>{form.watch("transferDetails.totalWithoutTax") ?? 0} €</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>IVA</span>
                      <span>{form.watch("transferDetails.tax") ?? 0} €</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-white font-medium">Total</span>
                      <span className="text-[#6EF7FF] font-bold">{form.watch("transferDetails.totalPrice")} €</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {form.watch("paymentMethod") === 'transfer' && (
        <div className="mt-4">
          <Alert className="bg-white/10 border-white/10">
            <AlertCircle className="h-4 w-4 text-[#6EF7FF]" />
            <AlertDescription className="text-white/70">
              Una vez confirmada tu solicitud, el traslado del
              vehículo quedará pendiente de asignación.
              Recibirás un email cuando el traslado sea asignado a un
              Drover. También recibirás la factura y los datos bancarios para
              efectuar el pago dentro del plazo establecido.
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
