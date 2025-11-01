
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Edit } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  height?: number;
  width?: number;
  label?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  height = 200,
  width = 400,
  label = "Firmar aquí"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [hasSignature, setHasSignature] = useState(false);

  // Setup canvas on mount and resize (corrige offset/escala en móviles)
  useEffect(() => {
    const setup = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const cssW = Math.max(320, rect.width);
      const cssH = height;
      const dpr = window.devicePixelRatio || 1;

      // Buffer en píxeles físicos para nitidez
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      // Mostrar a tamaño CSS
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      // Escalar contexto al DPR y limpiar
      try { (ctx as any).setTransform?.(1, 0, 0, 1, 0, 0); } catch { }
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    setup();
    const onResize = () => setup();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [height, width, label]);

  // Mouse event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dpr = window.devicePixelRatio || 1;
    setLastX((clientX - rect.left) * (canvas.width / (rect.width * dpr)));
    setLastY((clientY - rect.top) * (canvas.height / (rect.height * dpr)));

    if (!hasSignature) setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    // Prevent scrolling on touch devices
    if ('touches' in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Convertir coords a espacio del canvas (compensando escala CSS/DPR)
    const dpr = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * (canvas.width / (rect.width * dpr));
    const y = (clientY - rect.top) * (canvas.height / (rect.height * dpr));

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#111827';
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL();
      onSignatureChange(signatureData);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar en espacio de píxeles físicos
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHasSignature(false);
    onSignatureChange('');
  };

  return (
    <div ref={containerRef} className="relative border border-white/20 rounded-md">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="touch-none !w-full h-auto cursor-crosshair rounded-md bg-white"
      />

      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={clearCanvas}
        className="absolute top-2 right-2"
      >
        <X size={16} />
      </Button>

      {/* Sin placeholder para mantener el fondo transparente */}
    </div>
  );
};

export default SignaturePad;
