
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';

interface Props {
  onConfirm?: () => Promise<void>;
  isLoading?: boolean;
  data?: Partial<RegistrationFormData>;
  onPrevious?: () => void;
}

const RegistrationConfirmation: React.FC<Props> = ({ 
  onConfirm, 
  isLoading = false,
  data = {},
  onPrevious
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-[#6EF7FF]/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-[#6EF7FF]" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
          ¡Casi listo!
        </h3>
        <p className="text-white/70">
          Revisa que toda la información sea correcta antes de confirmar tu registro.
        </p>
      </div>

      {/* Resumen de datos */}
      <div className="bg-white/5 rounded-xl p-4 text-left space-y-3">
        <h4 className="text-white font-semibold mb-3">Resumen de tu registro:</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Tipo de cuenta:</span>
            <span className="text-white">{data.userType === 'client' ? 'Cliente' : 'Drover'}</span>
          </div>
          
          {data.fullName && (
            <div className="flex justify-between">
              <span className="text-white/60">Nombre:</span>
              <span className="text-white">{data.fullName}</span>
            </div>
          )}
          
          {data.email && (
            <div className="flex justify-between">
              <span className="text-white/60">Email:</span>
              <span className="text-white">{data.email}</span>
            </div>
          )}
          
          {data.phone && (
            <div className="flex justify-between">
              <span className="text-white/60">Teléfono:</span>
              <span className="text-white">{data.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-2 text-xs text-white/60">
          <input type="checkbox" className="mt-1" defaultChecked />
          <span>
            Acepto los términos y condiciones de uso y la política de privacidad.
          </span>
        </div>

      <div className="flex flex-col md:flex-row gap-4 md:justify-between">
        {onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
            className="order-2 md:order-1 flex items-center gap-2"
          >
            Anterior
          </Button>
        )}

        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="order-1 md:order-2 rounded-2xl bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A] font-bold h-12"
          style={{ fontFamily: "Helvetica" }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Confirmar Registro'
          )}
        </Button>
      </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
