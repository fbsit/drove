
import React, { useState } from "react";
import { Loader2, MessageSquare, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportManagement } from "@/hooks/admin/useSupportManagement";

const Soporte: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todas");

  const { 
    tickets, 
    metrics, 
    isLoading, 
    updateTicketStatus, 
    respondToTicket,
    isUpdatingStatus,
    isResponding 
  } = useSupportManagement();

  // Filtrar tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
                         ticket.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "todas" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = (ticketId: string, status: string) => {
    updateTicketStatus(ticketId, status);
  };

  const handleRespond = (ticketId: string) => {
    const response = prompt("Escribe tu respuesta:");
    if (response) {
      respondToTicket(ticketId, response);
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
          Sistema de Soporte
        </h1>
        <p className="text-white/70">
          Gestiona tickets de soporte de clientes y drovers. Responde y resuelve consultas.
        </p>
        
        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{metrics.total}</div>
            <div className="text-sm text-white/60">Total Tickets</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{metrics.open}</div>
            <div className="text-sm text-white/60">Abiertos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{metrics.resolved}</div>
            <div className="text-sm text-white/60">Resueltos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{metrics.urgent}</div>
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
          <option value="todas">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      {/* Lista de tickets */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{ticket.subject}</CardTitle>
                  <p className="text-white/60 text-sm">{ticket.clientName} - {ticket.clientEmail}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    ticket.priority === 'urgente' ? 'bg-red-500 text-white' :
                    ticket.priority === 'alta' ? 'bg-orange-500 text-white' :
                    ticket.priority === 'media' ? 'bg-yellow-500 text-black' :
                    'bg-green-500 text-white'
                  }`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    ticket.status === 'abierto' ? 'bg-blue-500 text-white' :
                    ticket.status === 'en_progreso' ? 'bg-yellow-500 text-black' :
                    ticket.status === 'resuelto' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">{ticket.message}</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(ticket.id)}
                  disabled={isResponding}
                  className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] border-0"
                >
                  {isResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1" />}
                  Responder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(ticket.id, 'en_progreso')}
                  disabled={isUpdatingStatus || ticket.status === 'en_progreso'}
                >
                  En Progreso
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(ticket.id, 'resuelto')}
                  disabled={isUpdatingStatus || ticket.status === 'resuelto'}
                >
                  Resolver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No se encontraron tickets de soporte</p>
          <p className="text-white/50 text-sm mt-2">
            Ajusta los filtros para encontrar los tickets que buscas
          </p>
        </div>
      )}
    </div>
  );
};

export default Soporte;
