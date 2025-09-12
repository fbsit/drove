import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SignatureCanvas from '@/components/SignatureCanvas';

interface SignatureCommentsStepProps {
  onDataReady: (data: { comments: string; signature: string }) => void;
  onDataChanged: (isValid: boolean) => void;
}

const SignatureCommentsStep: React.FC<SignatureCommentsStepProps> = ({
  onDataReady,
  onDataChanged,
}) => {
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    const isValid = signature.trim() !== '';
    onDataChanged(isValid);

    if (isValid) {
      onDataReady({ signature, comments });
    } else {
      onDataReady({ signature: '', comments });
    }
  }, [signature, comments, onDataReady, onDataChanged]);

  return (
    <div className="space-y-6">
      <p className="text-white/70">
        Añade cualquier comentario relevante sobre el estado del vehículo y firma
        para confirmar la recogida.
      </p>

      <Card className="bg-white/10 border-white/20 p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-white">
              Comentarios (opcional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Añade cualquier observación sobre el estado del vehículo..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">
              Firma<span className="text-red-500">*</span>
            </Label>
            {/* quitamos FormControl: no usamos react-hook-form aquí */}
            <SignatureCanvas onSignatureChange={setSignature} />
          </div>
        </div>
      </Card>

      {!signature && (
        <p className="text-red-400 text-sm">
          La firma es obligatoria para confirmar la recogida.
        </p>
      )}

      {signature && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-md text-sm mt-4">
          ✓ Firma registrada correctamente
        </div>
      )}
    </div>
  );
};

export default SignatureCommentsStep;
