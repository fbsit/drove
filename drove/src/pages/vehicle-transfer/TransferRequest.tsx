
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileTransferRequest from './MobileTransferRequest';
import TransferService from '@/services/transferService';
import CarDataService from '@/services/cardataService';
// Desktop version
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { useVehicleTransferRequest } from '@/hooks/useVehicleTransferRequest';
import MobileFooterNav from '@/components/layout/MobileFooterNav';

import VehicleDetailsStep from '@/components/vehicle-transfer/VehicleDetailsStep';
import PickupDetailsStep from '@/components/vehicle-transfer/PickupDetailsStep';
import SenderDetailsStep from '@/components/vehicle-transfer/SenderDetailsStep';
import ReceiverDetailsStep from '@/components/vehicle-transfer/ReceiverDetailsStep';
import TransferDetailsStep from '@/components/vehicle-transfer/TransferDetailsStep';
import PaymentMethodStep from '@/components/vehicle-transfer/PaymentMethodStep';
import ConfirmationStep from '@/components/vehicle-transfer/ConfirmationStep';

function normalizeTransferPayload(raw: any) {
  console.log('raw front', raw);
  const typeVehicle = raw?.vehicleDetails?.type ?? raw?.vehicleType ?? raw?.typeVehicle ?? 'coche';
  return {
    ...raw,
    // Mantener shape esperado por backend (msw y Nest leen typeVehicle en PDF/email)
    typeVehicle,
    vehicleDetails: {
      ...raw?.vehicleDetails,
      type: typeVehicle,
    },
  };
}

const DesktopTransferRequest: React.FC = () => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const { step, form, nextStep, prevStep, validateStep } = useVehicleTransferRequest();
  const [loading, setLoading] = React.useState(false);
  const [didAutoCreate, setDidAutoCreate] = React.useState(false);

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      // Se elimina validación de VIN contra backend para no bloquear el flujo
      nextStep();
    }
  };

  const handlePrevious = () => {
    prevStep();
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    const payload = normalizeTransferPayload(data);
    const transferenciaCreada = await TransferService.createTransfer(payload);
    console.log("transferenciaCreada", transferenciaCreada);
    toast({
      title: 'Éxito',
      description: 'Traslado solicitado correctamente.',
    });
    if (transferenciaCreada?.url) {
      window.location = transferenciaCreada?.url;
    }
  };

  // Auto-crear y redirigir en último paso cuando el método sea transferencia bancaria
  React.useEffect(() => {
    if (step === 7 && !didAutoCreate) {
      const pm = form.getValues().paymentMethod;
      if (pm === 'transfer') {
        (async () => {
          try {
            setLoading(true);
            const raw = form.getValues();
            const created = await TransferService.createTransfer(normalizeTransferPayload(raw));
            toast({ title: 'Éxito', description: 'Traslado solicitado correctamente.' });
            if (created?.id) {
              setDidAutoCreate(true);
              navigate(`/cliente/traslados/${created.id}`);
            }
          } catch (err: any) {
            console.error('[TRANSFER_REQUEST] Auto create error', err);
            toast({ variant: 'destructive', title: 'Error', description: err?.message || 'No se pudo crear el traslado.' });
          } finally {
            setLoading(false);
          }
        })();
      }
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <VehicleDetailsStep form={form as any} />;
      case 2:
        return <PickupDetailsStep form={form as any} />;
      case 3:
        return <SenderDetailsStep form={form as any} />;
      case 4:
        return <ReceiverDetailsStep form={form as any} />;
      case 5:
        return <TransferDetailsStep form={form as any} />;
      case 6:
        return <PaymentMethodStep form={form as any} />;
      case 7:
        return <ConfirmationStep form={form as any} />;
      default:
        return <VehicleDetailsStep form={form as any} />;
    }
  };

  const getStepProgress = () => {
    return Math.round((step / 7) * 100);
  };

  return (
    <div>
      <div>
        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
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

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          <CardContent className="p-3 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Solicitar Traslado</h1>
              <p className="text-white/70 text-sm sm:text-base">Completa los detalles del traslado de tu vehículo paso a paso.</p>
            </div>

            <Separator className="bg-white/20 mb-6 sm:mb-8" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                <div className="min-h-[400px]">
                  {renderStep()}
                </div>

                <Separator className="bg-white/20" />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 pt-4 pb-20 sm:pb-4">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="w-full sm:w-auto rounded-2xl border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                  ) : (
                    <div className="hidden sm:block"></div>
                  )}

                  {step < 7 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={step === 1 && !form.watch('vehicleDetails.vinValidated')}
                      className="w-full sm:w-auto rounded-2xl bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    form.watch('paymentMethod') === 'card' ? (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Firmar y Solicitar Traslado
                      </Button>
                    ) : (
                      <div className="text-white/70">Procesando solicitud y redirigiendo…</div>
                    )
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Footer Navigation */}
      <MobileFooterNav />
    </div>
  );
};

const TransferRequest: React.FC = () => {
  const isMobile = useIsMobile();

  // Render mobile-native version for mobile devices
  if (isMobile) {
    return <MobileTransferRequest />;
  }

  // Render desktop version for larger screens
  return <DesktopTransferRequest />;
};

export default TransferRequest;
