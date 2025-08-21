
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupportChat } from '@/contexts/SupportChatContext';
import { useAuth } from '@/contexts/AuthContext';

const DroverSupportChatFab = () => {
  const { openChat } = useSupportChat();
  const { user, isAuthenticated } = useAuth();

  // Mostrar para usuarios autenticados que sean clientes o drovers
  if (!isAuthenticated || !user || (user.user_type !== 'client' && user.user_type !== 'drover')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 hidden md:block">
      <Button
        onClick={openChat}
        size="lg"
        className="rounded-full w-14 h-14 bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] shadow-lg"
        aria-label="Abrir chat de soporte"
      >
        <MessageCircle size={24} />
      </Button>
    </div>
  );
};

export default DroverSupportChatFab;
