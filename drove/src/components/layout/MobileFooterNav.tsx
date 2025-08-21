
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Map, List, MessageCircle, Plus } from "lucide-react";
import { useSupportChat } from "@/contexts/SupportChatContext";

// NAVBAR BOTTOM SÓLO MOBILE—acá está el icono de soporte
const navItems = [
  {
    label: "Dashboard",
    to: "/cliente/dashboard",
    icon: Map,
    action: "link"
  },
  {
    label: "Mis traslados",
    to: "/cliente/traslados",
    icon: List,
    action: "link"
  },
  {
    label: "Solicitar",
    to: "/solicitar-traslado",
    icon: Plus,
    action: "link"
  },
  {
    label: "Soporte",
    to: "/soporte", // La ruta no importa ya que abrimos el chat
    icon: MessageCircle,
    action: "chat"
  },
];

const iconSize = 28;

const MobileFooterNav = () => {
  const location = useLocation();
  const { openChat } = useSupportChat();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-[#1B1230]/85 backdrop-blur-xl border-t border-[#6EF7FF44] z-50 py-2 md:hidden shadow-xl rounded-t-2xl animate-fade-in-up">
      {navItems.map((item) => {
        const isActive =
          item.action === "chat"
            ? false // nunca destacar el chat, UX por consistencia
            : location.pathname.startsWith(item.to);

        const Icon = item.icon;
        // Si acción link, link normal; si acción chat, botón que llama openChat
        if (item.action === "chat") {
          return (
            <button
              key={item.label}
              onClick={openChat}
              className={`flex flex-col items-center flex-1 text-xs font-montserrat font-bold transition-colors 
                ${isActive ? "text-[#6EF7FF]" : "text-white/70"}
                hover:text-[#6EF7FF] group relative`}
              aria-current={isActive ? "page" : undefined}
              tabIndex={0}
              style={{
                outline: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <div
                className={`rounded-full bg-[#6EF7FF]/10 group-hover:bg-[#6EF7FF]/20 p-2 mb-1 transition-all
                  ${isActive ? "shadow-[0_0_16px_2px_#6EF7FFCC]" : ""}`}
              >
                <Icon size={iconSize} strokeWidth={2.5} />
              </div>
              {item.label}
            </button>
          );
        } 
        return (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center flex-1 text-xs font-montserrat font-bold transition-colors
              ${isActive ? "text-[#6EF7FF]" : "text-white/70"}
              hover:text-[#6EF7FF] group relative`}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
            style={{
              outline: "none"
            }}
          >
            <div
              className={`rounded-full bg-[#6EF7FF]/10 group-hover:bg-[#6EF7FF]/20 p-2 mb-1 transition-all
                ${isActive ? "shadow-[0_0_16px_2px_#6EF7FFCC]" : ""}`}
            >
              <Icon size={iconSize} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {item.label}
            {isActive && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#6EF7FF] rounded-full shadow" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileFooterNav;
