
import React, { useMemo, useState } from "react";
import { Loader2, MessageSquare, AlertTriangle, Clock, CheckCircle, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupportManagement } from "@/hooks/admin/useSupportManagement";

const Soporte: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [agentFilter, setAgentFilter] = useState("todos");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const {
    tickets,
    metrics,
    isLoading,
    updateTicketStatus,
    respondToTicket,
    isUpdatingStatus,
    isResponding
  } = useSupportManagement();

  const filteredTickets = useMemo(() => {
    const term = (search || '').toLowerCase();
    return tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(term) ||
        ticket.clientName.toLowerCase().includes(term) ||
        (ticket.message || '').toLowerCase().includes(term);
      const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "todas" || ticket.priority === priorityFilter;
      const matchesAgent = agentFilter === "todos" || (ticket.assignedToName || '') === agentFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    });
  }, [tickets, search, statusFilter, priorityFilter, agentFilter]);

  const uniqueAgents = Array.from(new Set((tickets || []).map((t: any) => t.assignedToName).filter(Boolean)));

  // Ticket seleccionado (panel derecho)
  const selectedTicket = useMemo(() => {
    const list = filteredTickets;
    if (!selectedTicketId && list.length > 0) return list[0];
    return list.find((t) => t.id === selectedTicketId) || list[0];
  }, [filteredTickets, selectedTicketId]);

  React.useEffect(() => {
    if (!selectedTicketId && filteredTickets.length > 0) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets.length]);

  const handleUpdateStatus = (ticketId: string, status: string) => {
    (updateTicketStatus as any)({ ticketId, status });
  };

  const handleRespond = (ticketId: string) => {
    const response = prompt("Escribe tu respuesta:");
    if (response) {
      (respondToTicket as any)({ ticketId, response });
    }
  };

  if (isLoading) {
    return (
      <div className="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando tickets de soporte...</span>
        </div>
      </div>
    );
  }

  // Métricas visuales (fallback si no vienen del hook)
  const newTickets = (tickets || []).filter((t: any) => t.status === 'abierto').length;
  const openTickets = (tickets || []).filter((t: any) => t.status === 'en_progreso').length;
  const urgentTickets = (tickets || []).filter((t: any) => t.priority === 'urgente').length;
  const totalTickets = (tickets || []).length;

  return (
    <div className="">
      {/* Hero */}
      <section
        className="
          w-full
          flex flex-col items-center justify-center text-center
          bg-gradient-to-tr from-[#292244] via-[#242b36] to-[#191428]
          rounded-2xl
          border border-[#6EF7FF33]
          px-4 py-6 mb-5
          shadow-[0_2px_32px_0_#6EF7FF11]
          md:rounded-2xl md:py-8 md:px-8
          md:flex-row md:items-end md:text-left md:mb-6
        "
        style={{ minHeight: 120 }}
      >
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h1 className="text-xl md:text-2xl text-white font-bold mb-2 tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(110,247,255,0.18)]">Sistema de Soporte</h1>
          <p className="text-sm md:text-base text-white/70 max-w-md font-normal mb-0 leading-snug">Gestiona tickets de soporte de clientes y drovers. Responde y resuelve consultas.</p>
        </div>
      </section>

      {/* Métricas dentro de una card */}
      <div className="bg-white/10 rounded-2xl p-4 md:p-5 border border-white/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <MessageSquare className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tickets Nuevos</p>
                <p className="text-white text-2xl font-bold">{(metrics as any)?.open ?? (metrics as any)?.openTickets ?? newTickets}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <Clock className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tickets Abiertos</p>
                <p className="text-white text-2xl font-bold">{metrics?.open ?? openTickets}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <AlertTriangle className="text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tickets Urgentes</p>
                <p className="text-white text-2xl font-bold">{metrics?.urgent ?? urgentTickets}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6EF7FF]/20 rounded-xl">
                <CheckCircle className="text-[#6EF7FF]" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Tickets</p>
                <p className="text-white text-2xl font-bold">{metrics?.total ?? totalTickets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros en card */}
      <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-[#6EF7FF]" />
          <h3 className="text-white font-semibold">Filtros de Soporte</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Buscar tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-10 rounded-xl"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="resuelto">Resuelto</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las prioridades</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl">
              <SelectValue placeholder="Usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los usuarios</SelectItem>
              {uniqueAgents.map((name) => (
                <SelectItem key={name} value={name as string}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Maestro - detalle dentro de una card */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna izquierda: listado */}
          <div className="col-span-1 bg-black/20 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold">Tickets de Soporte</h3>
              <p className="text-white/50 text-sm">{filteredTickets.length} tickets encontrados</p>
            </div>
            <div className="max-h-[540px] overflow-y-auto divide-y divide-white/5">
              {filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition flex items-start gap-3 ${selectedTicket?.id === t.id ? 'bg-white/5' : ''}`}
                >
                  <div className="flex-1">
                    <p className="text-white font-medium truncate">{t.clientName}</p>
                    <p className="text-white/60 text-xs truncate">{t.subject}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'abierto' ? 'bg-blue-500 text-white' :
                      t.status === 'en_progreso' ? 'bg-yellow-500 text-black' :
                        t.status === 'resuelto' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>{t.status.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Columna derecha: detalle */}
          <div className="col-span-1 lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-black/20 rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{selectedTicket.subject}</h3>
                    <p className="text-white/60 text-sm">{selectedTicket.clientName} ({selectedTicket.clientEmail})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${selectedTicket.priority === 'urgente' ? 'bg-red-500' :
                        selectedTicket.priority === 'alta' ? 'bg-orange-500' :
                          selectedTicket.priority === 'media' ? 'bg-yellow-500 text-black' :
                            'bg-green-500'
                      }`}>
                      {selectedTicket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedTicket.status === 'abierto' ? 'bg-blue-500 text-white' :
                        selectedTicket.status === 'en_progreso' ? 'bg-yellow-500 text-black' :
                          selectedTicket.status === 'resuelto' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`