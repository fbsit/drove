
import React from "react";
import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (s: string) => void;
  isMobile: boolean;
}

const TrafficManagersSearchBar: React.FC<Props> = ({ value, onChange, isMobile }) => (
  <div
    className={`flex items-center bg-white/10 rounded-2xl border border-white/15 shadow-inner px-3 py-2 w-full max-w-xl ${
      isMobile ? "text-base" : "text-sm"
    }`}
    style={{
      minWidth: isMobile ? "0" : 260,
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "Helvetica"
    }}
  >
    <Search className="mr-2" strokeWidth={2.3} size={isMobile ? 19 : 17} color="#6EF7FF"/>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Buscar nombre o correo electrónico"
      className="bg-transparent outline-none border-none w-full placeholder:text-white/40 text-white"
      style={{ fontFamily: "Helvetica" }}
    />
  </div>
);

export default TrafficManagersSearchBar;
