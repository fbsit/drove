
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService, TicketStatusDTO, TicketReplyDTO } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { SupportMetrics } from '@/types/admin';

export const useSupportManagement = () => {
  const qc = useQueryClient();

  /* ─────────── Obtener tickets ─────────── */
  const {
    data: tickets = [],
    isLoading,
  } = useQuery<any[]>({
    queryKey: ['admin-support-tickets'],
    queryFn: AdminService.getSupportTickets,
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
