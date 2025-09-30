
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, User, UserCheck, Clock } from "lucide-react";
import { SupportTicket, SupportMessage } from "@/types/support-ticket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupportSocket } from "@/hooks/useSupportSocket";
import SupportService from "@/services/supportService";

interface SupportChatViewerProps {
  ticket: SupportTicket;
  onSendMessage: (ticketId: string, message: string) => void;
  onUpdateStatus: (ticketId: string, status: string) => void;
}

const SupportChatViewer: React.FC<SupportChatViewerProps> = ({
  ticket,
  onSendMessage,
  onUpdateStatus,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const messagesRef = useRef<SupportMessage[]>([]);

  // Inicializa y ordena mensajes por timestamp cuando cambia el ticket
  useEffect(() => {
    const base = (ticket?.messages || []).slice().sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setMessages(base);
    messagesRef.current = base;
  }, [ticket?.id]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const optimistic: SupportMessage = {
        id: `tmp-${Date.now()}`,
        content: newMessage,
        sender: "admin" as any,
        senderName: "Admin",
        timestamp: new Date().toISOString(),
        ticketId: ticket.id,
      } as any;
      setMessages(prev => {
        const next = [...prev, optimistic].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        messagesRef.current = next;
        return next;
      });
      // Enviar por REST; socket del cliente recibirá el broadcast y el admin se reconciliará sin requerir refresh manual
      onSendMessage(ticket.id, newMessage);
      setNewMessage("");
    }
  };

  // Socket en tiempo real para el ticket actual
  useSupportSocket(
    ticket?.id || null,
    (incoming) => {
      // Mapear a SupportMessage shape
      const msg: SupportMessage = {
        id: incoming.id,
        content: incoming.text,
        sender: incoming.sender === 'soporte' ? 'admin' as any : 'client' as any,
        senderName: incoming.sender === 'soporte' ? 'Admin' : 'Usuario',
        timestamp: new Date().toISOString(),
        ticketId: ticket.id,
      } as any;
      setMessages(prev => {
        // Eliminar optimistas que coincidan en texto y admin/user
        const filtered = prev.filter(m => !(String(m.id).startsWith('tmp-') && m.content === msg.content && m.sender === msg.sender));
        // Evitar duplicados por id
        if (filtered.some(m => String(m.id) === String(msg.id))) return filtered;
        const next = [...filtered, msg].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        messagesRef.current = next;
        return next;
      });
    },
    // onStatus
    (status) => {
      if (status === 'closed') onUpdateStatus(ticket.id, 'cerrado');
    },
    // onClosed
    () => onUpdateStatus(ticket.id, 'cerrado'),
    // onConnected/onDisconnected (admin vista no necesita pausar polling aquí)
    () => {},
    () => {},
    // onAdminMessage: asegura recepción aunque no se haya hecho join aún
    (payload: any) => {
      if (!payload || payload.ticketId !== ticket.id) return;
      const msg: SupportMessage = {
        id: String(payload.id),
        content: payload.content,
        sender: String(payload.sender).toLowerCase() as any,
        senderName: payload.senderName || (payload.sender === 'ADMIN' ? 'Admin' : 'Usuario'),
        timestamp: payload.timestamp || new Date().toISOString(),
        ticketId: ticket.id,
      } as any;
      setMessages(prev => {
        if (prev.some(m => String(m.id) === String(msg.id))) return prev;
        const next = [...prev, msg].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        messagesRef.current = next;
        return next;
      });
      // Fallback: refrescar desde servidor para garantizar consistencia si algún evento se perdió
      setTimeout(async () => {
        try {
          const tickets = await SupportService.getTickets();
          const found = (tickets || []).find((t: any) => t.id === ticket.id);
          if (found) {
            const fresh = (found.messages || []).slice().sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setMessages(fresh);
            messagesRef.current = fresh;
          }
        } catch {}
      }, 250);
    }
  );

  // Polling de respaldo cada 3s para garantizar que el admin vea mensajes nuevos
  useEffect(() => {
    let mounted = true;
    const fetchOnce = async () => {
      try {
        const tickets = await SupportService.getTickets();
        if (!mounted) return;
        const found = (tickets || []).find((t: any) => t.id === ticket.id);
        if (found) {
          const fresh = (found.messages || []).slice().sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          // Dedupe contra local
          const byId = new Map<string, SupportMessage>();
          for (const m of [...messagesRef.current, ...fresh]) byId.set(String(m.id), m as any);
          const merged = Array.from(byId.values()).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setMessages(merged);
          messagesRef.current = merged;
        }
      } catch {}
    };
    const id = setInterval(fetchOnce, 3000);
    // primera sincronización rápida
    fetchOnce();
    return () => { mounted = false; clearInterval(id); };
  }, [ticket.id]);


  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case "admin":
        return <UserCheck size={16} className="text-[#6EF7FF]" />;
      case "client":
      case "drover":
        return <User size={16} className="text-white/70" />;
      default:
        return <User size={16} className="text-white/70" />;
    }
  };

  const getSenderBg = (sender: string) => {
    return sender === "admin" ? "bg-[#6EF7FF]/20" : "bg-white/10";
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">{ticket.subject}</h3>
            <p className="text-white/60 text-sm">
              {ticket.clientName} ({ticket.clientType === "client" ? "Cliente" : "Drover"})
            </p>
          </div>
          <Select value={ticket.status} onValueChange={(value) => onUpdateStatus(ticket.id, value)}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nuevo">Nuevo</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="respondido">Respondido</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message: SupportMessage) => (
          <div key={message.id} className={`p-3 rounded-xl ${getSenderBg(message.sender)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getSenderIcon(message.sender)}
              <span className="text-white font-medium text-sm">{message.senderName}</span>
              <div className="flex items-center gap-1 text-white/50 text-xs ml-auto">
                <Clock size={12} />
                {new Date(message.timestamp).toLocaleString('es-ES')}
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{message.content}</p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            placeholder="Escribe tu respuesta..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            rows={3}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportChatViewer;
