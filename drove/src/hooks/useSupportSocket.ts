import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type Message = {
  id: string;
  sender: 'user' | 'soporte';
  text: string;
  timestamp: string;
};

export function useSupportSocket(
  ticketId: string | null,
  onMessage: (m: Message) => void,
  onStatus?: (status: string) => void,
  onClosed?: () => void,
  onConnected?: () => void,
  onDisconnected?: () => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const currentTicketRef = useRef<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? '';
    const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://drove-backend-production.up.railway.app';
    const s = io(`${BASE_URL}/support`, {
      path: '/socket.io',
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      withCredentials: false,
    });
    socketRef.current = s;

    s.on('connect', () => {
      if (ticketId) {
        currentTicketRef.current = ticketId;
        s.emit('support:join', { ticketId });
      }
      if (onConnected) onConnected();
    });
    s.on('disconnect', () => { if (onDisconnected) onDisconnected(); });

    s.on('support:message', (msg: any) => {
      const mapped: Message = {
        id: String(msg.id),
        sender: (String(msg.sender || '').toUpperCase() === 'ADMIN') ? 'soporte' : 'user',
        text: msg.content || '',
        timestamp: new Date(msg.timestamp || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      (mapped as any).ts = new Date(msg.timestamp || Date.now()).getTime();
      onMessage(mapped);
    });

    s.on('support:status', (p: any) => onStatus && onStatus(p?.status));
    s.on('support:closed', () => onClosed && onClosed());

    return () => {
      if (currentTicketRef.current) s.emit('support:leave', { ticketId: currentTicketRef.current });
      s.disconnect();
      socketRef.current = null;
    };
  }, [onMessage, onStatus, onClosed, onConnected, onDisconnected]);

  // Reunirse/cambiar de sala cuando cambia ticketId sin recrear el socket
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    if (!s.connected) return;
    const prev = currentTicketRef.current;
    if (prev && prev !== ticketId) s.emit('support:leave', { ticketId: prev });
    if (ticketId && ticketId !== prev) s.emit('support:join', { ticketId });
    currentTicketRef.current = ticketId;
  }, [ticketId]);

  return { socket: socketRef.current };
}


