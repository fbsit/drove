import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ChevronUp, ChevronDown, QrCode, Car, Clock } from 'lucide-react';

type TripLike = {
  id: string | number;
  status: string;
};

interface MobileTripActionBarProps {
  trip: TripLike;
  transferId: string;
  isAssignedDrover: boolean;
  droverInDestination: boolean;
  distanceToDestinationKm: number | null;
  isFinishing?: boolean;
  onStart: () => Promise<void> | void;
  onFinish: () => Promise<void> | void;
}

const MobileTripActionBar: React.FC<MobileTripActionBarProps> = ({
  trip,
  transferId,
  isAssignedDrover,
  droverInDestination,
  distanceToDestinationKm,
  isFinishing = false,
  onStart,
  onFinish,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isAssignedDrover) return null;

  const status = String(trip?.status || '').toUpperCase();

  // Construir lista de pendientes según estado
  const pendingItems: Array<{
    key: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    done?: boolean;
    icon?: React.ReactNode;
  }> = [];

  if (status === 'ASSIGNED') {
    pendingItems.push({
      key: 'qr-pickup',
      title: 'Escanear QR del cliente',
      description: 'Escanea el QR para registrar la recogida. El formulario se abrirá automáticamente tras el escaneo.',
      actionLabel: 'Escanear QR para recoger',
      onAction: () => navigate('/qr/scan'),
      icon: <QrCode className="text-[#6EF7FF]" size={18} />,
    });
  }

  if (status === 'PICKED_UP') {
    pendingItems.push({
      key: 'start-trip',
      title: 'Iniciar viaje',
      description: 'Marca el inicio para comenzar el seguimiento de ruta.',
      actionLabel: 'Iniciar viaje',
      onAction: () => onStart(),
      icon: <Car className="text-[#6EF7FF]" size={18} />,
    });
  }

  if (status === 'IN_PROGRESS') {
    pendingItems.push({
      key: 'qr-delivery',
      title: 'Escanear QR del receptor',
      description: 'Debes escanear el código QR del receptor para finalizar el traslado',
      actionLabel: 'Escanear QR para finalizar',
      onAction: () => navigate('/qr/scan'),
      icon: <QrCode className="text-[#6EF7FF]" size={18} />,
    });
  }

  if (status === 'REQUEST_FINISH') {
    pendingItems.push({
      key: 'delivery-verification',
      title: 'Completar verificación de entrega',
      description: 'Accede escaneando el QR del receptor. No navegamos directamente al formulario.',
      actionLabel: 'Escanear QR del receptor',
      onAction: () => navigate('/qr/scan'),
      icon: <QrCode className="text-[#6EF7FF]" size={18} />,
    });
  }

  const completed = pendingItems.filter(i => i.done).length;
  const total = pendingItems.length || 1;

  return (
    <>
      {/* Bottom Sheet (siempre montado; se anima con translateY) */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 w-full transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-full bg-[#1b1323] border-t border-white/10 p-4 shadow-2xl">
          <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-white">
                <AlertCircle className="text-orange-400" size={18} />
                <span className="font-semibold">Verificaciones Pendientes</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">×</button>
            </div>
            <div className="mt-3">
              <div className="text-white/70 text-sm mb-3 text-left">Completa las siguientes verificaciones para finalizar el traslado</div>
              <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-medium">Progreso</span>
                  <span className="rounded-full px-2 py-0.5 bg-[#2e2238] text-white">{completed}/{total}</span>
                </div>
                <div className="h-2 mt-2 rounded-full bg-[#2b1f37] overflow-hidden">
                  <div className="h-full bg-[#6EF7FF] transition-all" style={{ width: `${Math.min(100, Math.round((completed / total) * 100))}%` }} />
                </div>
              </div>
              <div className="my-3 border-t border-white/10" />
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-orange-400/50 bg-[#2b1b23]/40 p-4">
                    <div className="flex items-center gap-2 text-white">
                      {item.icon}
                      <div className="font-semibold">{item.title}</div>
                    </div>
                    {item.description && (
                      <div className="mt-2 text-white/80 text-sm">{item.description}</div>
                    )}
                    {item.actionLabel && item.onAction && (
                      <div className="mt-3">
                        <Button onClick={item.onAction} variant="outline" className="rounded-2xl border-[#6EF7FF] text-[#6EF7FF] hover:bg-[#6EF7FF]/10 hover:text-[#6EF7FF] shadow-[0_0_12px_rgba(110,247,255,0.35)]">
                          {item.actionLabel}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>

      {/* Barra fija inferior (siempre visible; el sheet aparece por encima) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1b1323]/90 border-t border-white/10 p-3 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button onClick={() => setIsOpen(true)} variant="secondary" className="flex-1 rounded-2xl bg-white/10 text-white hover:bg-white/20">
            <CheckCircle2 className="mr-2 opacity-80" /> Revisar pendientes
          </Button>
          <button
            aria-label="Abrir pendientes"
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-2xl border border-[#6EF7FF]/60 text-[#6EF7FF] flex items-center justify-center"
          >
            <ChevronUp />
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileTripActionBar;


