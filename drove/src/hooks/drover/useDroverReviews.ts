
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewService } from '@/services/reviewService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useDroverReviews = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /* ───── Obtener reseñas del drover ───── */
  const {
    data: reviews = [],
    isLoading,
  } = useQuery({
    queryKey: ['drover-reviews', user?.id],
    queryFn: () => ReviewService.getDroverReviews(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 60_000, // 1 min
  });

  /* ───── Obtener promedio de calificación ───── */
  const {
    data: averageRating,
    isLoading: isLoadingAverage,
  } = useQuery({
    queryKey: ['drover-average-rating', user?.id],
    queryFn: () => ReviewService.getDroverAverageRating(user?.id || ''),
    enabled: !!user?.id,
  });

  /* ───── Responder reseña ───── */
  const respondToReview = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      // No soportado en backend
      throw new Error('Responder reseñas no está soportado en este momento');
    },
    onError: (err: any) =>
      toast({
        variant: 'destructive',
        title: 'No disponible',
        description: err?.message ?? 'Responder reseñas no está soportado.',
      }),
  });

  return {
    reviews,
    isLoading,
    averageRating,
    isLoadingAverage,
    respondToReview: respondToReview.mutate,
    isResponding: respondToReview.isPending,
  };
};
