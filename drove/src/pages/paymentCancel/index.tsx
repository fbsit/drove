import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DroveLogo from '@/components/DroveLogo';
import { X } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const travelId = searchParams.get('travel');

  useEffect(() => {
    console.log('Pago cancelado para traslado:', travelId);
  }, [travelId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-drove p-4">
      <div className="bg-red-500/20 rounded-full p-6 mb-6">
        <X className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white">Pago cancelado</h1>
      <p className="text-white/80 mb-2">
        No se completó el pago para tu traslado <span className="font-mono">{travelId}</span>.
      </p>
      <p className="text-white/60 mb-6">Puedes intentar nuevamente o contactar soporte.</p>
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-2 bg-[#6EF7FF] text-white rounded-lg"
      >
        Volver atrás
      </button>
      <div className="mt-8">
        <DroveLogo size="lg" />
      </div>
    </div>
  );
};

export default PaymentCancel;
