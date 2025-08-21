
import React, { useEffect } from 'react';
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import { Check } from "lucide-react";
import DroveLogo from '@/components/DroveLogo';

interface ConfirmationStepProps {
  form: UseFormReturn<VehicleTransferRequest>;
  apiResponse?: any;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ form, apiResponse }) => {
  // Generar un ID de referencia para mostrar al cliente
  const referenceId = apiResponse?.id || `TRF-${new Date().getTime().toString().substring(5)}`;

  useEffect(() => {
    console.log("apiResponse", apiResponse)
    if(apiResponse){
      if (apiResponse.paymentMethod === 'card' && apiResponse.url) {
        const timer = setTimeout(() => {
          window.location.href = apiResponse.url!;
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  },[apiResponse]);

  // Obtener los valores del formulario de forma segura
  const formValues = form.getValues();
  const vehicleBrand = formValues.vehicleDetails?.brand || 'N/A';
  const vehicleModel = formValues.vehicleDetails?.model || 'N/A';
  const vehicleYear = formValues.vehicleDetails?.year || 'N/A';
  const licensePlate = formValues.vehicleDetails?.licensePlate || 'N/A';
  const totalPrice = formValues.transferDetails?.totalPrice || formValues.price || 0;
  const paymentMethod = formValues.paymentMethod || 'transfer';

  return (
    <div className="space-y-8 text-center">
      <div className="bg-[#6EF7FF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-[#6EF7FF]/30">
        <Check className="h-8 w-8 text-[#6EF7FF]" />
      </div>
      
      <h2 className="text-2xl font-bold text-white">¡Gracias!</h2>
      
      <div className="space-y-4">
        <p className="text-white/70">
          Hemos recibido tu solicitud. {paymentMethod !== 'card' ? 'Estamos asignando un DROVER para tu traslado.' : ''}
        </p>
        <p className="text-white/70">
          {paymentMethod !== 'card' ? 'Te notificaremos por email los estados del traslado.' : 'Reedirigiendo a la pasarela de pago para completar el proceso.'}
        </p>
      </div>
      
      <div className="pt-8">
        <DroveLogo size="md" />
      </div>
      
      <div className="mt-8 bg-white/5 rounded-xl p-6">
        <div className="text-left space-y-4">
          <div className="pb-2 border-b border-white/10">
            <span className="text-white/50 text-sm">Número de solicitud:</span>
            <p className="text-white font-mono">{referenceId}</p>
          </div>
          
          <div>
            <span className="text-white/50 text-sm">Vehículo:</span>
            <p className="text-white">{vehicleBrand} {vehicleModel} ({vehicleYear})</p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="text-white/50 text-sm">Matrícula:</span>
              <p className="text-white">{licensePlate}</p>
            </div>
            <div className="text-right">
              <span className="text-white/50 text-sm">Método de pago:</span>
              <p className="text-white capitalize">{paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}</p>
            </div>
          </div>
          
          {apiResponse && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="text-white/50 text-sm mb-1">Respuesta del servidor:</div>
              <div className="bg-black/20 p-2 rounded text-xs font-mono text-green-400 overflow-auto max-h-32">
                {JSON.stringify(apiResponse, null, 2)}
              </div>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white">Total:</span>
              <span className="text-[#6EF7FF] font-bold text-lg">{totalPrice} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;
