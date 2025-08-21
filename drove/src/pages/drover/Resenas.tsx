
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import MobileDroverFooterNav from '@/components/layout/MobileDroverFooterNav';
import { useDroverReviews } from '@/hooks/drover/useDroverReviews';

const ResenasDrover: React.FC = () => {
  const [responderId, setResponderId] = useState<string | null>(null);
  const [respuestaText, setRespuestaText] = useState('');

  const {
    reviews,
    isLoading,
    averageRating,
    respondToReview,
    isResponding
  } = useDroverReviews();

  const startResponder = (id: string, initial: string = '') => {
    setResponderId(id);
    setRespuestaText(initial);
  };

  const handleRespond = (reviewId: string, text: string) => {
    respondToReview({ reviewId, response: text });
    setResponderId(null);
    setRespuestaText('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#22142A]">
        <Star className="animate-spin text-[#6EF7FF] w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full bg-[#22142A] flex flex-col items-center py-8 px-2 pb-20">
        <h1 className="text-3xl md:text-4xl mb-4 text-white font-bold">Reseñas Recibidas</h1>
        
        {/* Mostrar promedio si está disponible */}
        {averageRating && (
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20}
                    className={i < Math.floor(averageRating.average) ? 'text-yellow-300' : 'text-gray-500'}
                    fill={i < Math.floor(averageRating.average) ? '#FACC15' : 'none'}
                  />
                ))}
              </div>
              <span className="text-white text-lg font-bold">{averageRating.average?.toFixed(1)}</span>
            </div>
            <p className="text-white/60 text-sm">Basado en {averageRating.count} reseñas</p>
          </div>
        )}

        <div className="w-full max-w-md flex flex-col gap-6">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-[#2A1B3D] rounded-2xl px-6 py-5 flex flex-col gap-2 border border-white/10"
            >
              {/* Encabezado */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-[#6EF7FF] font-bold mr-1">{review.clientName}</span>
                  <span className="text-white/50 text-xs">{new Date(review.createdAt).toLocaleDateString('es-ES')}</span>
                  {review.transferRoute && (
                    <span className="hidden md:inline-block text-[#6EF7FF] text-xs font-bold bg-[#6EF7FF]/10 rounded-xl px-2 py-0.5 mx-2">
                      {review.transferRoute}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16}
                      className={i < review.rating ? 'text-yellow-300' : 'text-gray-500'}
                      fill={i < review.rating ? '#FACC15' : 'none'}
                    />
                  ))}
                </div>
              </div>
              
              {/* Ruta en móvil */}
              {review.transferRoute && (
                <span className="md:hidden ml-0.5 text-[#6EF7FF] text-xs font-bold bg-[#6EF7FF]/10 rounded-xl px-2 py-0.5">
                  {review.transferRoute}
                </span>
              )}
              
              {/* Texto reseña */}
              <p className="text-white font-bold">{review.comment}</p>

              {/* Botón ver traslado */}
              {review.transferId && (
                <Link to={`/traslados/${review.transferId}`} className="w-fit mt-2">
                  <Button variant="outline" className="border-[#6EF7FF] text-[#6EF7FF] rounded-2xl h-8 text-sm">
                    Ver traslado
                  </Button>
                </Link>
              )}

              {/* Respuesta existente o formulario */}
              {review.droverResponse ? (
                <RespuestaBlock text={review.droverResponse} />
              ) : responderId === review.id ? (
                <RespuestaForm
                  value={respuestaText}
                  onChange={setRespuestaText}
                  onCancel={() => setResponderId(null)}
                  onPublish={() => handleRespond(review.id, respuestaText)}
                  loading={isResponding}
                />
              ) : (
                <Button
                  size="sm"
                  onClick={() => startResponder(review.id)}
                  className="w-fit mt-2 bg-[#6EF7FF]/80 text-[#22142A] rounded-2xl"
                >
                  Responder
                </Button>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-white/60 text-center">Aún no tienes reseñas.</p>
          )}
        </div>
      </div>

      <MobileDroverFooterNav />
    </>
  );
};

/* ---------------- sub-componentes pequeños ---------------- */

const RespuestaBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="border-l-4 border-[#6EF7FF] pl-3 mt-2">
    <span className="block text-xs text-[#6EF7FF] font-semibold mb-1">Tu respuesta:</span>
    <span className="text-white/80 text-sm">{text}</span>
  </div>
);

const RespuestaForm: React.FC<{
  value: string; onChange: (v: string) => void; onCancel: () => void;
  onPublish: () => void; loading: boolean;
}> = ({ value, onChange, onCancel, onPublish, loading }) => (
  <div className="flex flex-col gap-2 mt-2">
    <textarea
      className="rounded-2xl bg-[#22142A] text-white px-3 py-2"
      placeholder="Escribe tu respuesta..."
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <div className="flex gap-2">
      <Button
        onClick={onPublish}
        disabled={loading || !value.trim()}
        className="bg-[#6EF7FF] text-[#22142A] rounded-2xl h-9 px-4"
      >
        Publicar
      </Button>
      <Button variant="outline" onClick={onCancel} className="h-9 rounded-2xl">
        Cancelar
      </Button>
    </div>
  </div>
);

export default ResenasDrover;
