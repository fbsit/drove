
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { useVehicleTransferRequest } from '@/hooks/useVehicleTransferRequest';
import TransferService from '@/services/transferService';
import MobileFooterNav from '@/components/layout/MobileFooterNav';

import MobileVehicleDetailsStep from '@/components/vehicle-transfer/mobile/MobileVehicleDetailsStep';
import MobileSenderDetailsStep from '@/components/vehicle-transfer/mobile/MobileSenderDetailsStep';
import MobileReceiverDetailsStep from '@/components/vehicle-transfer/mobile/MobileReceiverDetailsStep';
import MobileTransferDetailsStep from '@/components/vehicle-transfer/mobile/MobileTransferDetailsStep';
import MobilePaymentMethodStep from '@/components/vehicle-transfer/mobile/MobilePaymentMethodStep';
import MobileConfirmationStep from '@/components/vehicle-transfer/mobile/MobileConfirmationStep';

// Import missing step
import { PickupDetailsStep } from '@/components/vehicle-transfer/PickupDetailsStep';

const MobileTransferRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { step, form, nextStep, prevStep, validateStep } = useVehicleTransferRequest();

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    prevStep();
  };

  const onSubmit = async (data: any) => {
    const created = await TransferService.createTransfer(data);
    toast({ title: 'Éxito', description: 'Traslado solicitado correctamente.' });
    if (created?.url) {
      // flujo tarjeta
      window.location.href = created.url;
    } else if (created?.id) {
      // flujo transferencia
      navigate(`/cliente/traslados/${created.id}`);
    } else {
      navigate('/cliente/dashboard');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <MobileVehicleDetailsStep form={form} />;
      case 2:
        return <PickupDetailsStep form={form} />;
      case 3:
        return <MobileSenderDetailsStep form={form} />;
      case 4:
        return <MobileReceiverDetailsStep form={form} />;
      case 5:
        return <MobileTransferDetailsStep form={form} onNext={handleNext} onPrev={handlePrevious} />;
      case 6:
        return <MobilePaymentMethodStep form={form} />;
      case 7:
        return <MobileConfirmationStep form={form} />;
      default:
        return <MobileVehicleDetailsStep form={form} />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Detalles del Vehículo';
      case 2:
        return 'Recogida y Entrega';
      case 3:
        return 'Datos del Remitente';
      case 4:
        return 'Datos del Destinatario';
      case 5:
        return 'Detalles del Traslado';
      case 6:
        return 'Método de Pago';
      case 7:
        return 'Confirmación';
      default:
        return 'Solicitar Traslado';
    }
  };

  const getStepProgress = () => {
    return Math.round((step / 7) * 100);
  };

  return (
    <div >
      <div >
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Paso {step} de 7</span>
            <span className="text-white/60 text-sm">{getStepProgress()}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-[#6EF7FF] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl rounded-2xl">
          <CardContent className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
                {getStepTitle()}
              </h1>
              <p className="text-white/70 text-sm">
                {step === 7 ? 'Revisa y confirma tu solicitud' : 'Completa la información solicitada'}
              </p>
            </div>

            <Separator className="bg-white/20 mb-6" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="min-h-[400px]">
                  {renderStep()}
                </div>

                <Separator className="bg-white/20" />

                <div className="flex flex-col gap-3 pt-4">
                  {step < 7 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full rounded-2xl bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] font-bold transition-all duration-200 shadow-lg hover:shadow-xl h-12"
                      style={{ fontFamily: "Helvetica" }}
                    >
                      Siguiente
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    form.watch('paymentMethod') === 'card' ? (
                      <Button
                        type="submit"
                        className="w-full rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl h-12"
                        style={{ fontFamily: "Helvetica" }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Firmar y Solicitar Traslado
                      </Button>
                    ) : (
                      <div className="text-white/70 text-center">Procesando solicitud y redirigiendo…</div>
                    )
                  )}

                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="w-full rounded-2xl border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200 h-12"
                      style={{ fontFamily: "Helvetica" }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Navbar siempre visible */}
      <MobileFooterNav />
    </div>
  );
};

export default MobileTransferRequest;
