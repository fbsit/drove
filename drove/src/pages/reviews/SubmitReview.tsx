import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!travelId) {
      toast({ variant: 'destructive', title: 'Enlace inválido', description: 'Falta el identificador del viaje.' });
    }
  }, [travelId]);

  const handleSubmit = async () => {
    if (!travelId) return;
    setIsSubmitting(true);
    try {
      await postReview({ travelId, rating, comment: comment.trim() || undefined });
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
          <div className="text-white/80 text-sm">Tu opinión nos ayuda a mejorar.</div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} className={`h-10 w-10 rounded-full border ${rating >= n ? 'bg-yellow-400 text-black' : 'bg-transparent text-white border-white/30'}`}>{n}</button>
            ))}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitReview;


