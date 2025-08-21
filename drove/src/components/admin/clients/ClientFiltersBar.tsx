
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, UserSquare } from "lucide-react";

interface Props {
  clientType: "empresa" | "persona" | "todos";
  onTypeChange: (type: "empresa" | "persona" | "todos") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const ClientFiltersBar: React.FC<Props> = ({
  clientType,
  onTypeChange,
  search,
  onSearchChange,
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
    <Tabs defaultValue={clientType} className="w-full md:w-auto">
      <TabsList className="flex bg-white/5">
        <TabsTrigger
          value="todos"
          className="data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A]"
          onClick={() => onTypeChange("todos")}
        >
          <Users size={18} className="mr-1" /> Todos
        </TabsTrigger>
        <TabsTrigger
          value="empresa"
          className="data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A]"
          onClick={() => onTypeChange("empresa")}
        >
          <UserSquare size={18} className="mr-1" /> Empresas
        </TabsTrigger>
        <TabsTrigger
          value="persona"
          className="data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A]"
          onClick={() => onTypeChange("persona")}
        >
          <Users size={18} className="mr-1" /> Personas naturales
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <Input
      className="w-full md:w-72 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60"
      placeholder="Buscar por nombre o correo..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  </div>
);

export default ClientFiltersBar;
