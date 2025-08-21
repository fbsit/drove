
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, FileText, User, MapPin, Upload } from 'lucide-react';

interface ConfirmationStepProps {
  onSubmit: (data: any, isCompletingProfile?: boolean) => Promise<void>;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ onSubmit }) => {
  const handleConfirm = async () => {
    await onSubmit({}, false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Solicitud Completada!
            </h2>
            <p className="text-white/60">
              Tu solicitud para ser Drover ha sido enviada exitosamente
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <User className="h-5 w-5 text-[#6EF7FF]" />
              <span className="text-white text-sm">Información personal completada</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <MapPin className="h-5 w-5 text-[#6EF7FF]" />
              <span className="text-white text-sm">Dirección registrada</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Upload className="h-5 w-5 text-[#6EF7FF]" />
              <span className="text-white text-sm">Documentación subida</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <FileText className="h-5 w-5 text-[#6EF7FF]" />
              <span className="text-white text-sm">Términos aceptados</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Próximos pasos:</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Revisaremos tu solicitud en 24-48 horas</li>
              <li>• Te contactaremos por email con el resultado</li>
              <li>• Si es aprobada, recibirás acceso a la plataforma</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationStep;
