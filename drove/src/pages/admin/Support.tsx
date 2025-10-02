
import React, { useMemo, useState } from "react";
import { Loader2, MessageCircle, Clock, AlertTriangle, CheckCircle, Filter, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportManagement } from "@/hooks/admin/useSupportManagement";
import { useSupportSocket } from "@/hooks/useSupportSocket";
import { playMessageTone, resumeAudioIfNeeded } from "@/lib/sound";
import SupportService from "@/services/supportService";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";

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

  // selección de ticket y memo de lista
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filteredTickets = useMemo(() => tickets, [tickets]);
  const selected = useMemo(() => filteredTickets.find((t: any) => t.id === selectedId) || filteredTickets[0], [filteredTickets, selectedId]);
  React.useEffect(() => { if (!selectedId && filteredTickets.length > 0) setSelectedId(filteredTickets[0].id); }, [filteredTickets.length]);
  React.useEffect(() => { if (selected?.id) setUnreadByTicket(prev => ({ ...prev, [selected.id]: 0 })); }, [selected?.id]);
  const [unreadByTicket, setUnreadByTicket] = useState<Record<string, number>>({});

  // Mensajes del ticket seleccionado con delta-sync
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const lastSeqRef = React.useRef<number>(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isClosed = React.useMemo(() => {
    const s = String(selected?.status || '').toLowerCase();
    return s === 'closed' || s === 'cerrado' || s === 'resuelto' || s === 'resolved';
  }, [selected?.status]);
  React.useEffect(() => {
    const msgs = (selected?.messages || []).slice().sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setSelectedMessages(msgs);
    lastSeqRef.current = Math.max(0, ...msgs.map((m: any) => m.seq || 0));
  }, [selected?.id]);

  // Auto-scroll al último mensaje
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [selectedMessages, selected?.id]);

  const fetchDeltaAndMerge = React.useCallback(async () => {
    if (!selected?.id) return;
    try {
      const res: any = await SupportService.getTicketMessagesDelta(selected.id, lastSeqRef.current);
      const fresh = res?.messages || [];
      if (fresh.length) {
        const mapped = fresh.map((m: any) => ({
          id: String(m.id), content: m.content, sender: String(m.sender).toLowerCase(), senderName: m.senderName, timestamp: m.timestamp, seq: m.seq,
        }));
        setSelectedMessages(prev => {
          const byId = new Map<string, any>();
          for (const m of [...prev, ...mapped]) byId.set(String(m.id), m);
          return Array.from(byId.values()).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
        lastSeqRef.current = res?.lastSeq ?? lastSeqRef.current;
      }
    } catch {}
    // marcar como leídos en backend para admin (opcional: ya se resetea en front, pero persistimos)
    try { await (SupportService as any).getTicketMessagesDelta(selected.id, lastSeqRef.current); } catch {}
  }, [selected?.id]);

  // Escuchar socket para el ticket seleccionado
  useSupportSocket(
    selected?.id || null,
    () => { console.log('[ADMIN] onMessage room'); fetchDeltaAndMerge(); resumeAudioIfNeeded(); playMessageTone(); },
    (status) => {
      if (status === 'closed') {
        console.log('[ADMIN] status closed');
        fetchDeltaAndMerge();
      }
    },
    () => { console.log('[ADMIN] closed event'); fetchDeltaAndMerge(); },
    () => console.log('[ADMIN] socket connected'),
    () => console.log('[ADMIN] socket disconnected'),
    (payload: any) => {
      if (!payload?.ticketId) return;
      if (payload.ticketId === selected?.id) {
        console.log('[ADMIN] onMessage all');
        fetchDeltaAndMerge();
        resumeAudioIfNeeded();
        playMessageTone();
      }
      // No incrementamos aquí para evitar doble conteo; usamos sólo support:unread
    },
    // onJoinedRoom
    () => { fetchDeltaAndMerge(); },
    // onUnread
    (p: any) => {
      if (!p?.ticketId) return;
      // Sólo contar no leídos destinados al admin
      if (String(p.side).toLowerCase() !== 'admin') return;
      // Si no estamos viendo ese ticket, incrementa en 1 (evitando blowup en reconexiones)
      if (selected?.id !== p.ticketId) {
        setUnreadByTicket(prev => {
          const current = prev[p.ticketId] || 0;
          return { ...prev, [p.ticketId]: current + 1 };
        });
        resumeAudioIfNeeded();
        playMessageTone();
      }
    }
  );

  const handleUpdateStatus = (ticketId: string, status: string) => {
    (updateTicketStatus as any)({ ticketId, status });
  };

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const submitInlineReply = async () => {
    if (!selected?.id || !replyText.trim() || isSending) return;
    try {
      setIsSending(true);
      await (respondToTicket as any)({ ticketId: selected.id, response: replyText.trim() });
      setReplyText('');
    } finally {
      setIsSending(false);
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
      <div className="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando tickets de soporte...</span>
        </div>
      </div>
    );
  }

  // Contadores según diseño (fallback computado desde tickets)
  const countNuevos = (tickets || []).filter((t: any) => t.status === 'abierto').length;
  const countAbiertos = (tickets || []).filter((t: any) => t.status === 'en_progreso').length;
  const countUrgentes = (tickets || []).filter((t: any) => t.priority === 'urgente').length;
  const countTotal = (tickets || []).length;

  return (
    <>
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

      {/* Métricas en card (como en la imagen) */}
      <div className="bg-white/10 rounded-2xl p-4 md:p-5 border border-white/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <MessageCircle className="text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tickets Nuevos</p>
                <p className="text-white text-2xl font-bold">{(metrics as any)?.open ?? countNuevos}</p>
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
                <p className="text-white text-2xl font-bold">{(metrics as any)?.inProgress ?? countAbiertos}</p>
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
                <p className="text-white text-2xl font-bold">{(metrics as any)?.urgent ?? countUrgentes}</p>
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
                <p className="text-white text-2xl font-bold">{(metrics as any)?.total ?? countTotal}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
              <SelectGroup>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl">
              <SelectValue placeholder="Todas las prioridades" />
            </SelectTrigger>
            <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
              <SelectGroup>
                <SelectItem value="todos">Todas las prioridades</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista izquierda + detalle derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: lista */}
        <div className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden lg:col-span-1 max-h-[70vh] flex flex-col">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-semibold">Tickets de Soporte</h3>
            <p className="text-white/50 text-sm">{filteredTickets.length} tickets encontrados</p>
          </div>
          <div className="overflow-y-auto">
            {filteredTickets.map((t: any) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/10 transition ${selected?.id === t.id ? 'bg-white/10' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold truncate">{t.clientName || t.clientEmail || 'Usuario'}</div>
                  {!!unreadByTicket[t.id] && (
                    <span className="min-w-[14px] h-[14px] inline-flex items-center justify-center px-1 text-[10px] rounded-full bg-red-500 text-white font-bold ml-2">
                      {unreadByTicket[t.id]}
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusColor(t.status)} text-white`}>{t.status}</span>
                    <span className={`text-[10px] ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                  </div>
                </div>
                <div className="text-white/50 text-xs truncate">{t.subject}</div>
                <div className="mt-1 text-white/60 text-xs line-clamp-2">{t.message}</div>
                {Array.isArray(t.messages) && t.messages.length > 0 && (
                  <div className="mt-1 text-white/50 text-[11px] truncate">
                    Último: {(t.messages[t.messages.length - 1].senderName) || t.clientName || t.clientEmail}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-white/40 text-xs">
                  <Clock size={12} /> {new Date(t.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Columna derecha: detalle */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle size={20} /> {selected.subject}
                  </CardTitle>
                  <p className="text-white/60 text-sm">{selected.clientName} ({selected.clientEmail})</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selected.status)} text-white`}>{selected.status.toUpperCase()}</span>
                  <span className={`text-sm font-semibold ${getPriorityColor(selected.priority)}`}>{selected.priority.toUpperCase()}</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Conversación completa */}
                <div ref={listRef} className="space-y-3 mb-4 max-h-[56vh] overflow-y-auto pr-1">
                  {(selectedMessages.length === 0) ? (
                    // Si el ticket no tiene historial en backend, mostramos el mensaje inicial del cliente
                    <div className="bg-white/5 text-white rounded-xl px-4 py-3 border border-white/10">
                      <div className="flex items-center justify-between text-white/80 text-xs mb-1">
                        <span className="font-semibold">{selected.clientName}</span>
                        <span>{new Date(selected.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm">{selected.message}</div>
                    </div>
                  ) : (
                    selectedMessages.map((m: any) => {
                        const isAdmin = String(m.sender).toLowerCase() === 'admin';
                        const bubble = isAdmin
                          ? 'bg-[#29485a] text-white border border-[#6EF7FF33]'
                          : 'bg-white/5 text-white border border-white/10';
                        const name = m.senderName || (isAdmin ? 'Admin Support' : selected.clientName || 'Usuario');
                        return (
                          <div key={m.id} className={`${bubble} rounded-xl px-4 py-3`}>
                            <div className="flex items-center justify-between text-white/80 text-xs mb-1">
                              <span className="font-semibold">{name}</span>
                              <span>{new Date(m.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="text-sm">{m.content}</div>
                          </div>
                        );
                      })
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock size={16} />
                    <span>Creado: {new Date(selected.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {!isClosed && (
                      <Button size="sm" onClick={() => handleUpdateStatus(selected.id, 'resuelto')} disabled={isUpdatingStatus} className="bg-green-600 hover:bg-green-700">
                        {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                {/* Responder inline */}
                {isClosed ? (
                  <div className="mt-4 text-white/70 text-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2">Este ticket está cerrado. No se pueden enviar mensajes.</div>
                ) : (
                  <div className="w-full flex flex-row items-center gap-2 mt-4">
                    <Input
                      className="rounded-2xl flex-1 text-base placeholder:text-white/60 bg-white/5 border border-white/10 focus:ring-2 focus:ring-[#6EF7FF] text-white"
                      placeholder="Escribe tu respuesta..."
                      maxLength={500}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitInlineReply(); }}
                    />
                    <Button className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold px-4 py-2" disabled={!replyText.trim() || isResponding || isSending} onClick={submitInlineReply}>
                      {isResponding || isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-white/60">No hay tickets seleccionados</div>
          )}
        </div>
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

    {/* Modal eliminado; respuesta inline */}
    </>
  );
};

export default Support;
