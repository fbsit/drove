import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const QRScanner: React.FC = () => {
  const navigate = useNavigate();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Fallback simple: leer como texto si el código está en la imagen (no implementado OCR)
      // Redirigir a página de QR manual si fallara; el QR actual llega también como link clickable en correos
      // Aquí podrías integrar 'jsqr' + canvas para decodificar en el futuro.
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-xl font-bold mb-4">Escanear Código QR</h1>
      <p className="text-white/70 text-sm mb-6 text-center">Apunta la cámara al código QR entregado por el cliente.</p>
      <label className="w-full max-w-xs h-52 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer">
        <span className="text-white/70">Abrir cámara</span>
        <input className="hidden" type="file" accept="image/*" capture="environment" onChange={onFile} />
      </label>
      <Button variant="secondary" className="mt-6" onClick={() => navigate(-1)}>Volver</Button>
    </div>
  );
};

export default QRScanner;
