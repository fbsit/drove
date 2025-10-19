
import React, { useRef, useState, useEffect } from 'react';
import { FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface ScaledSignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
  value?: string; // dataURL/URL para hidratar
  width?: number;
  height?: number;
}

const ScaledSignatureCanvas: React.FC<ScaledSignatureCanvasProps> = ({
  onSignatureChange,
  value,
  width = 400,
  height = 150
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [scale, setScale] = useState(1);

  // Inicializar canvas cuando el componente se monta
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = containerRef.current;
      if (!container) return;

      // Obtener el contexto del canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Establecer dimensiones del canvas basadas en el tamaño del contenedor
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;

      // Calcular escala para mantener proporción
      const newScale = containerWidth / width;
      setScale(newScale);

      // Establecer dimensiones del canvas en píxeles físicos para mayor nitidez
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Aplicar el estilo para escalar el canvas al tamaño deseado
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${height * newScale}px`;

      // Escalar el contexto para compensar el DPR
      ctx.scale(dpr, dpr);

      // Fondo transparente sin texto guía
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    setupCanvas();

    // Re-configurar el canvas cuando cambie el tamaño de la ventana
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height]);

  // Hidratar desde value si existe
  useEffect(() => {
    const url = String(value || '').trim();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!url) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = window.devicePixelRatio || 1;
      const targetW = width * dpr;
      const targetH = height * dpr;
      const scale = Math.min(targetW / img.width, targetH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offX = (targetW - drawW) / 2;
      const offY = (targetH - drawH) / 2;
      ctx.drawImage(img, offX, offY, drawW, drawH);
      setHasDrawn(true);
    };
    img.onerror = () => {};
    img.src = url;
  }, [value, width, height]);

  // Convertir coordenadas del evento a coordenadas del canvas
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    return {
      x: (clientX - rect.left) * (width / rect.width),
      y: (clientY - rect.top) * (height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      // Evento táctil
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Evento del mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY);
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);

    // Limpiar texto guía si es la primera vez que dibuja
    if (!hasDrawn) {
      clearGuidanceText();
      setHasDrawn(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevenir scroll u otros comportamientos al dibujar

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      // Evento táctil
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Evento del mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const endDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);

      // Solo guardar la firma si realmente se ha dibujado
      if (hasDrawn) {
        const signatureData = canvasRef.current.toDataURL();
        onSignatureChange(signatureData);
      }
    }
  };

  const clearGuidanceText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mantener fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas a transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHasDrawn(false);
    onSignatureChange('');
  };

  return (
    <FormControl>
      <div className="space-y-2 ">
        <div ref={containerRef} className="w-full">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            className="border border-white/20 rounded-md cursor-crosshair touch-none bg-white max-h-60"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={clearCanvas}
          className="text-sm"
        >
          Borrar firma
        </Button>
      </div>
    </FormControl>
  );
};

export default ScaledSignatureCanvas;
