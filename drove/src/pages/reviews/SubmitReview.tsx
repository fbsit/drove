import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { Star } from 'lucide-react';

// Minimal API service for posting a review
async function postReview(payload: { travelId: string; rating: number; comment?: string }) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('No se pudo guardar la reseña');
  return res.json();
}

const SubmitReview: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const travelId = params.get('travelId') || '';
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existing, setExisting] = useState<any | null>(null);
  const [droverName, setDroverName] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!travelId) {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Enlace inválido', description: 'Falta el identificador del viaje.' });
        return;
      }
      try {
        // 1) Traer info del viaje para mostrar drover
        const travel = await ApiService.get<any>(`/travels/${encodeURIComponent(travelId)}`);
        setDroverName(travel?.drover?.contactInfo?.fullName || 'tu drover');
        // 2) Comprobar si ya existe reseña
        const review = await ApiService.get<any>(`/reviews/travel/${encodeURIComponent(travelId)}`);
        if (review && review.id) setExisting(review);
      } catch {}
      finally {
        setIsLoading(false);
      }
    })();
  }, [travelId]);

  const handleSubmit = async () => {
    if (!travelId) return;
    setIsSubmitting(true);
    try {
      await ApiService.post('/reviews', { travelId, rating, comment: comment.trim() || undefined });
      toast({ title: '¡Gracias por tu reseña!' });
      navigate('/');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'No se pudo enviar la reseña' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4 flex items-center justify-center">
      <Card className="max-w-md w-full bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Califica tu traslado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-white/70">Cargando…</div>
          ) : existing ? (
            <div className="text-white/80">
              Ya registraste una reseña para este viaje. ¡Gracias!
            </div>
          ) : (
            <>
              <div className="text-white/80 text-sm">Tu opinión sobre {droverName} nos ayuda a mejorar.</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
                  {[1,2,3,4,5].map((n) => {
                    const active = (hoverRating ?? rating) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(n)}
                        className="p-1"
                        title={`${n} estrella${n>1?'s':''}`}
                      >
                        <Star
                          className={active ? 'text-yellow-400' : 'text-white/40'}
                          size={28}
                          fill={active ? 'currentColor' : 'none'}
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-white/80 text-sm ml-1">{(hoverRating ?? rating)}/5</span>
              </div>
              <textarea
                className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white"
                rows={4}
                placeholder="Comentario (opcional)"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <Button onClick={handleSubmit} disabled={!travelId || isSubmitting} className="bg-[#6EF7FF] text-[#22142A] hover:bg-[#6EF7FF]/80 w-full">
                {isSubmitting ? 'Enviando…' : 'Enviar reseña'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitReview;


