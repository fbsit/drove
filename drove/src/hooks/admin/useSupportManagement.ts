
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService, TicketStatusDTO, TicketReplyDTO } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { SupportMetrics } from '@/types/admin';

export const useSupportManagement = (filters?: { search?: string; status?: string; priority?: string }) => {
  const qc = useQueryClient();
  const debouncedSearch = useDebouncedValue(filters?.search ?? '', 300);
  const normalizedStatus = filters?.status ?? 'todos';
  const normalizedPriority = filters?.priority ?? 'todos';

  /* ─────────── Obtener tickets con filtros server-side ─────────── */
  const {
    data: tickets = [],
    isLoading,
  } = useQuery<any[]>({
    queryKey: ['admin-support-tickets', { search: debouncedSearch, status: normalizedStatus, priority: normalizedPriority }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { search?: string; status?: string; priority?: string }];
      const search = params?.search || '';
      const status = params?.status && params.status !== 'todos' ? params.status : undefined;
      const priority = params?.priority && params.priority !== 'todos' ? params.priority : undefined;
      return AdminService.getSupportTickets({ search, status, priority } as any);
    },
    refetchInterval: 60_000,
  });

  /* ─────────── Mutación: actualizar estado ─────────── */
  const updateTicketStatus = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) => {
      const dto: TicketStatusDTO = { status: status as any };
      return AdminService.updateTicketStatus(ticketId, dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({ title: 'Estado actualizado', description: 'Ticket actualizado.' });
    },
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error',
       description: 'No se pudo actualizar el estado.',
      }),
  });

  /* ─────────── Mutación: responder ticket ─────────── */
  const respondToTicket = useMutation({
    mutationFn: ({ ticketId, response }: { ticketId: string; response: string }) => {
      const dto: TicketReplyDTO = { response };
      return AdminService.respondToTicket(ticketId, dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({ title: 'Respuesta enviada', description: 'Respuesta registrada.' });
    },
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar la respuesta.',
      }),
  });

  /* ─────────── Métricas calculadas ─────────── */
  const metrics: SupportMetrics = {
    total:        tickets.length,
    open:         tickets.filter((t) => t.status === 'open').length,
    inProgress:   tickets.filter((t) => t.status === 'in-progress').length,
    closed:       tickets.filter((t) => t.status === 'closed').length,
    resolved:     tickets.filter((t) => t.status === 'resolved').length,
    urgent:       tickets.filter((t) => t.priority === 'urgent').length,
    avgResponseTime: '-',        // rellena si tu API lo entrega
    /* compatibilidad con tu antigua interfaz */
    totalTickets:  tickets.length,
    openTickets:   tickets.filter((t) => t.status === 'open').length,
    closedTickets: tickets.filter((t) => t.status === 'closed').length,
  };

  return {
    tickets,
    isLoading,
    metrics,
    updateTicketStatus: updateTicketStatus.mutate,
    respondToTicket:    respondToTicket.mutate,
    isUpdatingStatus:   updateTicketStatus.isPending,
    isResponding:       respondToTicket.isPending,
  };
};
