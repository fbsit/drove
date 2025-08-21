// src/pages/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DroveLogo from '@/components/DroveLogo';
import { Check } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const travelId = searchParams.get('travel');

  useEffect(() => {
    // Opcional: podrías fetch detalles del viaje con travelId
    console.log('Pago exitoso para traslado:', travelId);
    // Redirigir a home tras 5s, si se desea
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [travelId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-drove p-4">
      <div className="bg-green-500/20 rounded-full p-6 mb-6">
        <Check className="h-12 w-12 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white">Pago completado</h1>
      <p className="text-white/80 mb-2">
        Hemos recibido el pago para tu traslado <span className="font-mono">{travelId}</span>.
      </p>
      <p className="text-white/60 mb-6">Gracias por confiar en Drove. Serás redirigido pronto.</p>
      <DroveLogo size="lg" />
    </div>
  );
};

export default PaymentSuccess;
