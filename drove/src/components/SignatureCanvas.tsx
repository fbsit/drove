import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
  value?: string; // dataURL o URL previa para hidratar la firma
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  value,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastDataUrlRef = useRef<string>('');
  const lastSizeRef = useRef<{ wPx: number; hPx: number }>({ wPx: 0, hPx: 0 });
  const resizeTimerRef = useRef<number | null>(null);

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
    const doResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.max(320, Math.min(600, parent.clientWidth));
      const height = 170;
      const ratio = window.devicePixelRatio || 1;
      const desiredW = Math.floor(width * ratio);
      const desiredH = Math.floor(height * ratio);

      // Evitar reset si el tamaño no cambió (cambiar dimensiones borra el lienzo)
      if (canvas.width !== desiredW || canvas.height !== desiredH) {
        // Snapshot del trazo actual para rehidratar tras el resize
        try {
          const snapshot = (hasDrawn || isDrawing) ? canvas.toDataURL() : lastDataUrlRef.current;
          if (snapshot) lastDataUrlRef.current = snapshot;
        } catch {}

        canvas.width = desiredW;
        canvas.height = desiredH;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }
      const c = canvas.getContext('2d');
      if (c) {
        c.scale(ratio, ratio);
        c.lineWidth = 2.5;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        // Redibujar la última firma si existe para evitar "reinicios" visuales
        const url = String(lastDataUrlRef.current || '').trim();
        if (url) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              c.clearRect(0, 0, canvas.width, canvas.height);
              const cssW = width; // ya estamos en espacio CSS por el scale(ratio, ratio)
              const cssH = height;
              const scale = Math.min(cssW / img.width, cssH / img.height);
              const drawW = img.width * scale;
              const drawH = img.height * scale;
              const offX = (cssW - drawW) / 2;
              const offY = (cssH - drawH) / 2;
              c.drawImage(img, offX, offY, drawW, drawH);
            } catch {}
          };
          img.src = url;
        }
      }
      lastSizeRef.current = { wPx: desiredW, hPx: desiredH };
    };
    const resize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }
      // Debounce 120ms para evitar clears mientras se dibuja
      resizeTimerRef.current = window.setTimeout(() => doResize(), 120);
    };

    doResize();
    const ro = new ResizeObserver(() => resize());
    try { ro.observe(canvas.parentElement!); } catch {}
    return () => { try { ro.disconnect(); } catch {} };
  }, []);

  // Hidratar visualmente desde value cuando exista o cambie
  useEffect(() => {
    const url = String(value || '').trim();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!url) {
      // Si no hay valor, limpiar pero no tocar hasDrawn (permite mostrar el botón si ya dibujó)
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Limpiar y dibujar la imagen escalada dentro del canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ratio = window.devicePixelRatio || 1;
      // El canvas internamente está escalado por ratio, usamos tamaño CSS para mantener proporción
      const cssWidth = parseFloat(canvas.style.width || String(canvas.width / ratio));
      const cssHeight = parseFloat(canvas.style.height || String(canvas.height / ratio));
      const scaleX = (canvas.width / ratio) / img.width;
      const scaleY = (canvas.height / ratio) / img.height;
      const scale = Math.min(scaleX, scaleY);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = ((canvas.width / ratio) - drawW) / 2;
      const offsetY = ((canvas.height / ratio) - drawH) / 2;

      // Ajustar transform para espacio en CSS coords
      ctx.save();
      ctx.scale(ratio, ratio);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      setHasDrawn(true);
      lastDataUrlRef.current = url;
    };
    img.onerror = () => {
      // Si falla, no rompemos el lienzo
    };
    img.src = url;
  }, [value]);

  /* ───────── handlers ───────── */
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Si hay una firma previa y va a empezar a dibujar, la persistimos como background implícito (ya está en lastDataUrlRef)
    if (!hasDrawn && lastDataUrlRef.current) setHasDrawn(true);

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
      const dataUrl = canvasRef.current.toDataURL();
      lastDataUrlRef.current = dataUrl;
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHasDrawn(false);
    lastDataUrlRef.current = '';
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
