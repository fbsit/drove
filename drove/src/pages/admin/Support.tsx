
import React, { useState } from "react";
import { Loader2, MessageCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportManagement } from "@/hooks/admin/useSupportManagement";
import { useDebouncedValue } from "@/hooks/useDebounce";

const Support: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todos");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { 
    tickets, 
    metrics, 
    isLoading, 
    updateTicketStatus, 
    respondToTicket,
    isUpdatingStatus,
    isResponding 
  } = useSupportManagement({ search: debouncedSearch, status: statusFilter, priority: priorityFilter });

  // Server-side filtering
  const filteredTickets = tickets;

  const handleUpdateStatus = (ticketId: string, status: string) => {
    updateTicketStatus(ticketId, status);
  };

  const handleRespond = (ticketId: string) => {
    const response = prompt("Escribe tu respuesta:");
    if (response) {
      respondToTicket(ticketId, response);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-500';
      case 'alta': return 'text-orange-500';
      case 'media': return 'text-yellow-500';
      case 'baja': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto': return 'bg-red-500';
      case 'en_progreso': return 'bg-yellow-500';
      case 'resuelto': return 'bg-green-500';
      case 'cerrado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando tickets de soporte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          Gestión de Soporte
        </h1>
        <p className="text-white/70">
          Administra y responde a los tickets de soporte de clientes y drovers.
        </p>
        
        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{metrics.total}</div>
            <div className="text-sm text-white/60">Total Tickets</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{metrics.open}</div>
            <div className="text-sm text-white/60">Abiertos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{metrics.inProgress}</div>
            <div className="text-sm text-white/60">En Progreso</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{metrics.resolved}</div>
            <div className="text-sm text-white/60">Resueltos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{metrics.urgent}</div>
            <div className="text-sm text-white/60">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_progreso">En Progreso</option>
          <option value="resuelto">Resuelto</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="todos">Todas las prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* Lista de tickets */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle size={20} />
                    {ticket.subject}
                  </CardTitle>
                  <p className="text-white/60 text-sm">{ticket.clientName} - {ticket.clientEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)} text-white`}>
                    {ticket.status.toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">{ticket.message}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Clock size={16} />
                  <span>Creado: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(ticket.id)}
                    disabled={isResponding}
                  >
                    {isResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Responder"}
                  </Button>
                  {ticket.status !== 'resuelto' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(ticket.id, 'resuelto')}
                      disabled={isUpdatingStatus}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/70 text-lg">No se encontraron tickets</p>
          <p className="text-white/50 text-sm mt-2">
            Ajusta los filtros para encontrar los tickets que buscas
          </p>
        </div>
      )}
    </div>
  );
};

export default Support;
