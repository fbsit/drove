
import React from "react";
import { Clock, User, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { SupportTicket } from "@/types/support-ticket";

interface TicketCardProps {
  ticket: SupportTicket;
  isSelected: boolean;
  onClick: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo": return "bg-red-500";
      case "abierto": return "bg-yellow-500";
      case "respondido": return "bg-blue-500";
      case "cerrado": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente": return "text-red-400";
      case "alta": return "text-orange-400";
      case "media": return "text-yellow-400";
      case "baja": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgente" || priority === "alta") {
      return <AlertCircle size={16} className={getPriorityColor(priority)} />;
    }
    return <CheckCircle size={16} className={getPriorityColor(priority)} />;
  };

  return (
    <div 
      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
        isSelected ? 'bg-[#6EF7FF]/10 border-l-4 border-l-[#6EF7FF]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6EF7FF]/20 rounded-full flex items-center justify-center">
            <User size={16} className="text-[#6EF7FF]" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{ticket.clientName}</h4>
            <p className="text-white/60 text-xs">
              {ticket.clientType === "client" ? "Cliente" : "Drover"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getPriorityIcon(ticket.priority)}
          <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>
      </div>

      <h3 className="text-white font-medium mb-2 text-sm leading-tight">{ticket.subject}</h3>
      
      <p className="text-white/70 text-xs mb-3 line-clamp-2 leading-relaxed">
        {ticket.lastMessage}
      </p>

      <div className="flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {new Date(ticket.lastMessageTime).toLocaleDateString('es-ES')}
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare size={12} />
          {ticket.messages.length}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
