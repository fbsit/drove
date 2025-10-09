
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { SupportChatProvider } from '@/contexts/SupportChatContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from '@/components/ui/toaster';
import { resumeAudioIfNeeded, warmupAudioElements } from '@/lib/sound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    const handler = () => {
      resumeAudioIfNeeded();
      warmupAudioElements();
      // Quitamos listeners después de la primera interacción
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <SupportChatProvider>
            {children}
            <Toaster />
          </SupportChatProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
