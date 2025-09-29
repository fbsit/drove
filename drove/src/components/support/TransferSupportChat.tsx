
import React, { useState, useRef, useEffect } from "react";
import { User as UserIcon, Check, MessageCircle, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import SupportService from "@/services/supportService";

type Message = {
  id: string;
  sender: "user" | "soporte";
  text: string;
  timestamp: string;
};

type TicketStatus = "pendiente" | "en_progreso" | "resuelto";

// Estado inicial por defecto
const INITIAL_STATUS: TicketStatus = "pendiente";

const statusLabels: Record<TicketStatus, string> = {
  pendiente: "Pendiente de agente",
  en_progreso: "En conversación",
  resuelto: "Resuelto",
};

const statusColors: Record<TicketStatus, string> = {
  pendiente: "bg-yellow-400 text-black",
  en_progreso: "bg-[#6EF7FF] text-[#22142A]",
  resuelto: "bg-green-400 text-[#22142A]",
};

const statusIcons: Record<TicketStatus, JSX.Element> = {
  pendiente: <MessageCircle size={18} className="inline mr-1" />,
  en_progreso: <MessageCircle size={18} className="inline mr-1" />,
  resuelto: <Check size={18} className="inline mr-1" />,
};

const TransferSupportChat: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const transferId = React.useMemo(() => {
    const m = location.pathname.match(/traslados\/activo\/(\w+)/);
    return m?.[1] || undefined;
  }, [location.pathname]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<TicketStatus>(INITIAL_STATUS);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll al último mensaje
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Cargar/conectar con tickets reales
  const loadOrCreateTicket = React.useCallback(async () => {
    try {
      const ticket = await SupportService.getMyOpen();
      setTicketId(ticket?.id || null);
      const serverMsgs = (ticket?.messages || []).map((m: any) => ({
        id: String(m.id),
        sender: m.sender === 'admin' ? 'soporte' : 'user',
        text: m.content || '',
        timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      })) as Message[];
      setMessages(serverMsgs);
      setStatus(ticket?.status === 'closed' ? 'resuelto' : 'en_progreso');
    } catch (e: any) {
      console.error('[SUPPORT] load tickets error', e);
    }
  }, [user, transferId]);

  useEffect(() => {
    loadOrCreateTicket();
    const id = setInterval(loadOrCreateTicket, 15000);
    return () => clearInterval(id);
  }, [loadOrCreateTicket]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const payloadText = input.trim();
    setInput('');

    try {
      await SupportService.sendMyMessage(payloadText);
      await loadOrCreateTicket();
    } catch (e: any) {
      console.error('[SUPPORT] send message error', e);
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'No se pudo enviar el mensaje.' });
    }
  };

  const handleCloseChat = async () => {
    try {
      await SupportService.closeMyTicket();
      setStatus('resuelto');
      toast({ title: 'Conversación cerrada', description: 'Hemos cerrado tu ticket de soporte.' });
      // refrescar estado por si el backend retorna más datos
      setTimeout(loadOrCreateTicket, 300);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'No se pudo cerrar el ticket.' });
    }
  };

  // Avatar para diferenciar burbujas
  const getAvatar = (sender: "user" | "soporte") =>
    sender === "user" ? (
      <div className="bg-[#6EF7FF] text-[#22142A] font-bold rounded-full w-8 h-8 flex items-center justify-center text-xs shadow mr-2">
        <span>YO</span>
      </div>
    ) : (
      <div className="bg-[#22142A] border-2 border-[#6EF7FF] rounded-full w-8 h-8 flex items-center justify-center text-[#6EF7FF] font-bold text-xs shadow mr-2">
        <span>D</span>
      </div>
    );

  return (
    <div className="w-[90vw] lg:w-[40vw] flex flex-col bg-[#22142A] rounded-2xl shadow-2xl pt-2 pb-0" style={{ minHeight: 460, fontFamily: "Helvetica" }}>
      {/* Header: estado del ticket */}
      <div className="flex flex-col items-center px-5 pt-6 pb-2 border-b border-white/10">
        <span className={`px-4 py-1 text-xs rounded-2xl font-bold mb-2 flex items-center shadow gap-1 ${statusColors[status]}`} style={{ fontFamily: "Montserrat, Helvetica", fontWeight: 700 }}>
          {statusIcons[status]}
          {statusLabels[status]}
        </span>
        <span className="text-base md:text-lg text-white font-bold tracking-tight" style={{ fontFamily: "Montserrat, Helvetica", fontWeight: 700 }}>
          Soporte de traslado
        </span>
        <span className="text-xs text-white/80 mb-0.5 text-center" style={{ fontFamily: "Helvetica" }}>
          Resuelve dudas o incidencias de tu traslado vía chat privado.
        </span>
        {status !== 'resuelto' && (
          <div className="mt-2">
            <Button
              variant="outline"
              className="rounded-2xl border-white/30 text-white hover:bg-white/10 px-3 py-1 h-8"
              onClick={handleCloseChat}
            >
              Cerrar conversación
            </Button>
          </div>
        )}
      </div>

      {/* Mensaje gamificado si está pendiente */}
      {status === "pendiente" && (
        <div className="w-full flex items-center justify-center text-sm text-yellow-600 bg-yellow-200/80 rounded-xl px-4 py-2 mb-2 animate-pulse mx-auto font-semibold" style={{ fontFamily: "Helvetica" }}>
          <MessageCircle className="mr-1" size={18} />
          Un agente responderá pronto...
        </div>
      )}
      {/* Chat */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 pb-2 scrollbar"
        style={{
          maxHeight: 320,
          minHeight: 220,
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const isGroupStart = !prev || prev.sender !== msg.sender;
          const marginTop = isGroupStart ? 16 : 6; // mayor separación entre remitentes
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`w-full flex ${isUser ? "justify-end" : "justify-start"} items-start`}
              style={{ marginTop }}
            >
              {!isUser && getAvatar("soporte")}
              <div className={`${isUser ? "mr-2" : "ml-2"} max-w-[80%]`}
              >
                {isGroupStart && (
                  <div className={`text-[11px] mb-1 ${isUser ? "text-right text-white/70" : "text-left text-white/70"}`}>
                    {isUser ? "Tú" : "Admin"}
                  </div>
                )}
                <div
                  className={`w-fit p-2 md:p-2.5 rounded-2xl text-sm shadow font-medium ${isUser
                    ? "bg-[#6EF7FF] text-[#22142A] rounded-br-sm"
                    : "bg-white/10 text-white rounded-bl-sm border border-[#6EF7FF]"
                    }`}
                  style={{
                    color: isUser ? "#22142A" : "white",
                    fontFamily: isUser ? "Helvetica" : "Helvetica",
                  }}
                >
                  {msg.text}
                  <span
                    className={`block mt-1 text-[11px] font-normal pl-1 ${isUser ? "text-[#22142A]/60" : "text-white/90"
                      }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
              {isUser && getAvatar("user")}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="w-full flex flex-row items-center gap-2 p-3 pt-2 border-t border-white/10 bg-[#22142A] rounded-b-2xl" style={{ minHeight: 58 }}>
        <Input
          className="rounded-2xl flex-1 text-base placeholder:text-drove-gray bg-white/5 border-0 ring-2 ring-drove-accent focus:ring-2 focus:ring-[#6EF7FF] text-white font-normal"
          placeholder="Escribe tu mensaje…"
          disabled={status === "resuelto"}
          maxLength={400}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          style={{ fontFamily: "Helvetica" }}
        />
        <Button
          className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold px-4 py-2 shadow-lg text-base transition-all duración-150"
          disabled={status === "resuelto" || !input.trim()}
          onClick={handleSend}
          style={{ fontFamily: "Montserrat, Helvetica", fontWeight: 700 }}
        >
          <Send size={20} />
          <span className="hidden md:block">Enviar</span>
        </Button>

      </div>
    </div>
  );
};

export default TransferSupportChat;
