import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Pequeño decodificador QR usando jsQR si está disponible (opcional)
type JsQR = (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;

const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId: number | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setActive(true);
        }

        const scan = async () => {
          if (!videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Carga perezosa de jsQR si está disponible en el bundle
          try {
            const mod: any = (await import('jsqr')).default || (await import('jsqr'));
            const jsQR: JsQR = mod as JsQR;
            const result = jsQR(imageData.data, canvas.width, canvas.height);
            if (result && result.data) {
              const url = result.data.trim();
              // Redirección directa si es URL válida
              try {
                new URL(url);
                navigate(url.startsWith('http') ? url.replace(location.origin, '') : url);
              } catch {
                // Si no es URL absoluta, navegar internamente
                navigate(url);
              }
              return; // detener al navegar
            }
          } catch {
            // Si jsQR no está disponible, no rompe la UI
          }

          rafId = requestAnimationFrame(scan);
        };
        rafId = requestAnimationFrame(scan);
      } catch (e: any) {
        setError('No pudimos acceder a la cámara. Revisa permisos.');
      }
    };

    start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-xl font-bold mb-4">Escanear Código QR</h1>
      <p className="text-white/70 text-sm mb-4 text-center">Apunta la cámara al código QR. Redireccionaremos automáticamente.</p>
      {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/20 bg-black/40">
        <video ref={videoRef} className="w-full h-auto" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!active && <div className="absolute inset-0 flex items-center justify-center text-white/70">Iniciando cámara…</div>}
      </div>
      <Button variant="secondary" className="mt-6" onClick={() => navigate(-1)}>Volver</Button>
    </div>
  );
};

export default QRScanner;
