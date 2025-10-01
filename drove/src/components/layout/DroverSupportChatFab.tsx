import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupportChat } from '@/contexts/SupportChatContext';
import { useSupportSocket } from '@/hooks/useSupportSocket';

const DroverSupportChatFab = () => {
  const { openChat } = useSupportChat();

  // Leer directamente desde localStorage
  const role = localStorage.getItem('auth_user_role')?.toLowerCase();
  const token = localStorage.getItem('auth_token');

  // Consideramos autenticado si hay token y role válido
  const isAuthenticated = Boolean(token);
  const [hasUnread, setHasUnread] = React.useState(false);

  // Escuchar notificaciones globales de no leídos
  useSupportSocket(
    null,
    () => {},
    undefined,
    undefined,
    undefined,
    undefined,
    // onAdminMessage: cualquier mensaje nuevo del admin enciende el badge
    (payload: any) => { if (String(payload?.sender || '').toLowerCase() === 'admin') setHasUnread(true); },
    // onUnread: marcar badge si es para el cliente/drover
    (p: any) => { if (String(p?.side).toLowerCase() === 'client') setHasUnread(true); }
  );

  if (!isAuthenticated || (role !== 'client' && role !== 'drover')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 hidden md:block">
      <Button
        onClick={() => { setHasUnread(false); openChat(); }}
        size="lg"
        className="rounded-full w-14 h-14 bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] shadow-lg p-0"
        aria-label="Abrir chat de soporte"
      >
        <div className='relative'>
          <MessageCircle className='!h-6 !w-6' />
          {hasUnread && (
            <span className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#6EF7FF]' />
          )}
        </div>
      </Button>
    </div>
  );
};

export default DroverSupportChatFab;
