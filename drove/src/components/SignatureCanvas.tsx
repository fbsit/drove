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
    // Mejora de estabilidad de trazo
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Ajustar tamaño del canvas al contenedor para mejor densidad
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.max(320, Math.min(600, parent.clientWidth));
      const height = 170;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      const c = canvas.getContext('2d');
      if (c) {
        c.scale(ratio, ratio);
        c.lineWidth = 2.5;
        c.lineCap = 'round';
        c.lineJoin = 'round';
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    try { ro.observe(canvas.parentElement!); } catch {}
    return () => { try { ro.disconnect(); } catch {} };
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
    ctx.strokeStyle = '#111827';
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
          width={480}
          height={170}
          data-testid="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="rounded-md cursor-crosshair w-full touch-none bg-transparent"
        />
        {/* Botón de limpiar como X en la esquina */}
        {hasDrawn && (
          <button
            type="button"
            onClick={clearCanvas}
            aria-label="Borrar firma"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SignatureCanvas;
