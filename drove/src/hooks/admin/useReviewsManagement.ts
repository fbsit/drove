
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewService } from '@/services/reviewService';
import { toast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebounce';

export const useReviewsManagement = (filters?: { search?: string; rating?: string; drover?: string; responded?: string }) => {
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedValue(filters?.search ?? '', 300);
  const rating = filters?.rating ?? 'todas';
  const drover = filters?.drover ?? 'todos';
  const responded = filters?.responded ?? 'todas';

  /* ───── Obtener todas las reseñas (admin) ───── */
  const {
    data: reviews = [],
    isLoading,
  } = useQuery({
    queryKey: ['admin-reviews', { search: debouncedSearch, rating, drover, responded }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { search?: string; rating?: string; drover?: string; responded?: string }];
      // Backend actual solo tiene GET /reviews sin filtros; si se agregan, añadir aquí query params
      // Implementamos un fallback: pedimos todo y dejamos que el servidor en el futuro soporte filtros
      return ReviewService.getAllReviews();
    },
    refetchInterval: 60_000, // 1 min
  });

  /* ───── Responder reseña ───── */
  const respondToReview = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      throw new Error('Responder reseñas no está soportado por el backend actual');
    },
    onError: (err: any) =>
      toast({
        variant: 'destructive',
        title: 'No disponible',
        description: err?.message ?? 'Responder reseñas no está soportado.',
      }),
  });

  /* ───── Marcar como vista ───── */
  const markAsViewed = useMutation({
    mutationFn: async (reviewId: string) => {
      throw new Error('Marcar reseñas como vistas no está soportado');
    },
    onError: (err: any) =>
      toast({
        variant: 'destructive',
        title: 'No disponible',
        description: err?.message ?? 'Marcar como vista no está soportado.',
      }),
  });

  /* ───── Listado de drovers para filtros ───── */
  const drovers = (reviews || []).map((r: any) => ({
    id: r.transferId,
    name: r.droverName,
  }));

  return {
    reviews,
    isLoading,
    drovers,
    respondToReview: respondToReview.mutate,
    markAsViewed: markAsViewed.mutate,
    isResponding: respondToReview.isPending,
    isMarkingAsViewed: markAsViewed.isPending,
  };
};
