import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  /* ───────── init ───────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Fondo transparente (por defecto) para incrustar la firma sin background en el PDF
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  /* ───────── handlers ───────── */
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);

    const { clientX, clientY } =
      'touches' in e
        ? (e.preventDefault(), e.touches[0])
        : e;

    const rect = canvas.getBoundingClientRect();
    setLastX(clientX - rect.left);
    setLastY(clientY - rect.top);

    if (!hasDrawn) setHasDrawn(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || !canvasRef.current) return;
    if ('touches' in e) e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { clientX, clientY } =
      'touches' in e ? e.touches[0] : e;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#111827'; // negro/gris oscuro para buen contraste
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const endDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      onSignatureChange(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHasDrawn(false);
    onSignatureChange('');
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          data-testid="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="border border-white/20 rounded-md cursor-crosshair w-full touch-none bg-white"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-xs text-black/40 bg-white/70 px-2 py-1 rounded">Firme aquí</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={clearCanvas}
          className="text-sm"
        >
          Borrar firma
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // fuerza emitir el valor actual (por si solo tocó y salió)
            if (canvasRef.current) onSignatureChange(canvasRef.current.toDataURL());
          }}
          className="text-sm"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
