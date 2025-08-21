
import React, { useState, useRef, useEffect } from "react";
import { User, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type Message = {
  id: string;
  sender: "user" | "soporte";
  text: string;
  timestamp: string;
};

type TicketStatus = "pendiente" | "en_progreso" | "resuelto";

// Simulación de conversación y estado
const MOCK_TICKET_STATUS: TicketStatus = "pendiente";
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "user",
    text: "Hola, tengo una duda sobre la recogida.",
    timestamp: "09:12",
  },
  {
    id: "2",
    sender: "soporte",
    text: "¡Hola! Gracias por contactar con soporte DROVE. Un agente revisará tu mensaje en breve.",
    timestamp: "09:15",
  },
];

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
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<TicketStatus>(MOCK_TICKET_STATUS);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll al último mensaje
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulación: cuando el usuario envía, aparece una auto-respuesta tras 2s si está pendiente
  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");

    if (status === "pendiente") {
      toast({
        title: "¡Gracias!",
        description: "Un agente DROVE atenderá tu consulta muy pronto.",
      });
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          {
            id: crypto.randomUUID(),
            sender: "soporte",
            text: "¡Hemos recibido tu mensaje! Un agente está en camino para ayudarte en tu traslado.",
            timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setStatus("en_progreso");
      }, 2000);
    }
  };

  // Avatar para diferenciar burbujas
  const getAvatar = (sender: "user" | "soporte") =>
    sender === "user" ? (
      <div className="bg-[#6EF7FF] text-[#22142A] font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg shadow mr-2">
        <span>YO</span>
      </div>
    ) : (
      <div className="bg-[#22142A] border-2 border-[#6EF7FF] rounded-full w-8 h-8 flex items-center justify-center text-[#6EF7FF] font-bold text-lg shadow mr-2">
        <span>D</span>
      </div>
    );

  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-[#22142A] rounded-2xl shadow-2xl pt-2 pb-0" style={{ minHeight: 460, fontFamily: "Helvetica" }}>
      {/* Header: estado del ticket */}
      <div className="flex flex-col items-center px-5 pt-6 pb-2">
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
        className="flex-1 overflow-y-auto px-3 pb-2"
        style={{
          maxHeight: 320,
          minHeight: 220,
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "soporte" && getAvatar("soporte")}
            <div
              className={`max-w-[70%] p-2 md:p-2.5 rounded-2xl text-sm shadow font-medium ${
                msg.sender === "user"
                  ? "bg-[#6EF7FF] text-[#22142A] rounded-br-sm"
                  : "bg-white/10 text-white rounded-bl-sm border border-[#6EF7FF]"
              }`}
              style={{
                // Mejora texto sobre fondo cian: ¡nunca blanco puro sobre cian!
                color: msg.sender === "user" ? "#22142A" : "white",
                fontFamily: msg.sender === "soporte" ? "Helvetica" : "Helvetica"
              }}
            >
              {msg.text}
              <span 
                className={`block mt-1 text-[11px] font-normal pl-1 ${
                  msg.sender === "user" 
                    ? "text-[#22142A]/60" 
                    : "text-white/90"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
            {msg.sender === "user" && getAvatar("user")}
          </div>
        ))}
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
          className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold px-4 py-2 shadow-lg text-base transition-all duration-150"
          disabled={status === "resuelto" || !input.trim()}
          onClick={handleSend}
          style={{ fontFamily: "Montserrat, Helvetica", fontWeight: 700 }}
        >
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default TransferSupportChat;
