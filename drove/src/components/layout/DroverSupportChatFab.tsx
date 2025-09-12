import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupportChat } from '@/contexts/SupportChatContext';

const DroverSupportChatFab = () => {
  const { openChat } = useSupportChat();

  // Leer directamente desde localStorage
  const role = localStorage.getItem('auth_user_role')?.toLowerCase();
  const token = localStorage.getItem('auth_token');

  // Consideramos autenticado si hay token y role válido
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated || (role !== 'client' && role !== 'drover')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 hidden md:block">
      <Button
        onClick={openChat}
        size="lg"
        className="rounded-full w-14 h-14 bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] shadow-lg p-0"
        aria-label="Abrir chat de soporte"
      >
        <MessageCircle className='!h-6 !w-6' />
      </Button>
    </div>
  );
};

export default DroverSupportChatFab;
