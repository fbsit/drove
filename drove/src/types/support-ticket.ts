
export interface SupportMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: "client" | "drover" | "admin";
  senderName: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: "nuevo" | "abierto" | "respondido" | "cerrado";
  priority: "baja" | "media" | "alta" | "urgente";
  clientName: string;
  clientType: "client" | "drover";
  transferId?: string;
  createdAt: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: SupportMessage[];
  assignedTo?: string;
}
