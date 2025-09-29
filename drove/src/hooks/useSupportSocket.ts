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
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? '';
    const s = io('/support', {
      path: '/socket.io',
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      transports: ['websocket'],
    });
    socketRef.current = s;

    s.on('connect', () => {
      if (ticketId) s.emit('support:join', { ticketId });
    });

    s.on('support:message', (msg: any) => {
      const mapped: Message = {
        id: String(msg.id),
        sender: (String(msg.sender || '').toUpperCase() === 'ADMIN') ? 'soporte' : 'user',
        text: msg.content || '',
        timestamp: new Date(msg.timestamp || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      onMessage(mapped);
    });

    s.on('support:status', (p: any) => onStatus && onStatus(p?.status));
    s.on('support:closed', () => onClosed && onClosed());

    return () => {
      if (ticketId) s.emit('support:leave', { ticketId });
      s.disconnect();
      socketRef.current = null;
    };
  }, [ticketId, onMessage, onStatus, onClosed]);

  return { socket: socketRef.current };
}


