import React, { createContext, useContext, useEffect, useState } from 'react';
import { playNotificationChime, resumeAudioIfNeeded } from '@/lib/sound';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface TravelOffer {
  travelId: string;
  clientName: string;
  origin: string;
  destination: string;
  price: number;
  vehicleType: string;
  scheduledDate: string;
  scheduledTime: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentOffer: TravelOffer | null;
  showOfferModal: boolean;
  acceptOffer: (travelId: string) => void;
  declineOffer: (travelId: string) => void;
  closeOfferModal: () => void;
  onNotification?: (cb: (n: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const API_URL = 'https://drove-backend-production.up.railway.app';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<TravelOffer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      console.log('🔌 Conectando WebSocket para usuario:', user.id, 'role=', user.role);
      
      const newSocket = io(API_URL, {
        transports: ['websocket'],
        auth: { 
          userId: user.id,
          role: (user.role || '').toUpperCase()
        }
      });

      newSocket.on('connect', () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket desconectado');
        setIsConnected(false);
      });

      // Escuchar ofertas de viajes (solo drover)
      if ((user.role || '').toLowerCase() === 'drover') {
        newSocket.on('travel.offer', (offerData: TravelOffer) => {
          console.log('🚗 Nueva oferta de viaje recibida:', offerData);
          setCurrentOffer(offerData);
          setShowOfferModal(true);
        });
      }

      // Notificaciones para cualquier rol
      newSocket.on('notification:new', (n: any) => {
        console.log('🔔 notification:new', n);
        // Intentar asegurar el contexto de audio (si el usuario ya interactuó, reanuda)
        resumeAudioIfNeeded();
        playNotificationChime();
        window.dispatchEvent(new CustomEvent('notification:new', { detail: n }));
      });

      // Confirmación de respuesta enviada
      newSocket.on('travel.response.sent', ({ travelId, accepted }) => {
        console.log(`📤 Respuesta enviada para viaje ${travelId}:`, accepted ? 'Aceptado' : 'Rechazado');
        setShowOfferModal(false);
        setCurrentOffer(null);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Desconectando WebSocket');
        newSocket.disconnect();
      };
    }
  }, [user?.id, user?.role]);

  const acceptOffer = (travelId: string) => {
    if (socket) {
      console.log('✅ Aceptando oferta para viaje:', travelId);
      socket.emit('travel.response', { travelId, accept: true });
    }
  };

  const declineOffer = (travelId: string) => {
    if (socket) {
      console.log('❌ Rechazando oferta para viaje:', travelId);
      socket.emit('travel.response', { travelId, accept: false });
    }
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setCurrentOffer(null);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      currentOffer,
      showOfferModal,
      acceptOffer,
      declineOffer,
      closeOfferModal,
      onNotification: (cb: (n: any) => void) => {
        const handler = (e: any) => cb(e.detail);
        window.addEventListener('notification:new', handler);
        return () => window.removeEventListener('notification:new', handler);
      }
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
};