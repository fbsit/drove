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
  onAdminMessage?: (payload: any) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const currentTicketRef = useRef<string | null>(null);
  const onMessageRef = useRef(onMessage);
  const onStatusRef = useRef(onStatus);
  const onClosedRef = useRef(onClosed);
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  const onAdminMessageRef = useRef(onAdminMessage);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onStatusRef.current = onStatus; }, [onStatus]);
  useEffect(() => { onClosedRef.current = onClosed; }, [onClosed]);
  useEffect(() => { onConnectedRef.current = onConnected; }, [onConnected]);
  useEffect(() => { onDisconnectedRef.current = onDisconnected; }, [onDisconnected]);
  useEffect(() => { onAdminMessageRef.current = onAdminMessage; }, [onAdminMessage]);

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
      if (onConnectedRef.current) onConnectedRef.current();
    });
    s.on('disconnect', () => { if (onDisconnectedRef.current) onDisconnectedRef.current(); });

    s.on('support:message', (msg: any) => {
      const mapped: Message = {
        id: String(msg.id),
        sender: (String(msg.sender || '').toUpperCase() === 'ADMIN') ? 'soporte' : 'user',
        text: msg.content || '',
        timestamp: new Date(msg.timestamp || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      (mapped as any).ts = new Date(msg.timestamp || Date.now()).getTime();
      if (onMessageRef.current) onMessageRef.current(mapped);
    });

    s.on('support:status', (p: any) => onStatusRef.current && onStatusRef.current(p?.status));
    s.on('support:closed', () => onClosedRef.current && onClosedRef.current());
    s.on('support:message-admin', (p: any) => onAdminMessageRef.current && onAdminMessageRef.current(p));
    s.on('support:message-all', (p: any) => onAdminMessageRef.current && onAdminMessageRef.current(p));

    return () => {
      if (currentTicketRef.current) s.emit('support:leave', { ticketId: currentTicketRef.current });
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

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


