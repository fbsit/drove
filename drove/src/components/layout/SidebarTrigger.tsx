
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const SidebarTrigger: React.FC = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const triggerSize = 32;

  return (
    <button
      aria-label={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
      onClick={toggleSidebar}
      className="
        absolute
        top-1/2
        right-[-16px]
        -translate-y-1/2
        flex items-center justify-center
        w-8 h-8
        bg-[#6EF7FF]
        hover:bg-[#32dfff]
        text-[#22142A]
        rounded-full
        shadow-lg
        border-4 border-[#22142A]
        z-50
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#6EF7FF]/80
      "
      style={{
        width: `${triggerSize}px`,
        height: `${triggerSize}px`,
        minWidth: `${triggerSize}px`,
        minHeight: `${triggerSize}px`,
        maxWidth: `${triggerSize}px`,
        maxHeight: `${triggerSize}px`,
      }}
      tabIndex={0}
    >
      {isCollapsed
        ? <ChevronRight size={16} strokeWidth={2.2} />
        : <ChevronLeft size={16} strokeWidth={2.2} />
      }
    </button>
  );
};

export default SidebarTrigger;
