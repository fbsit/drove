
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { useSupportChat } from '@/contexts/SupportChatContext';
import TransferSupportChat from './TransferSupportChat';
import { X } from 'lucide-react';

const SupportChatModal: React.FC = () => {
  const { isOpen, closeChat } = useSupportChat();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <DialogContent className="p-0 bg-transparent border-0 shadow-none max-w-[90vw] [&>button]:hidden justify-center w-fit">
        <DialogHeader className="sr-only">
          <h2>Chat de Soporte</h2>
        </DialogHeader>
        <div className="relative w-fit">
          <button
            onClick={closeChat}
            className="absolute top-2 right-2 z-50 "
            aria-label="Cerrar chat"
          >
            <X size={20} className="text-white" />
          </button>
          <TransferSupportChat />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportChatModal;
