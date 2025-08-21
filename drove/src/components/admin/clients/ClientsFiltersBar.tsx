import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, UserSquare } from "lucide-react";

interface ClientsFiltersBarProps {
  tipo: "empresa" | "persona" | "todos";
  setTipo: (t: "empresa" | "persona" | "todos") => void;
  estado: "todos" | "aprobado" | "pendiente" | "rechazado";
  setEstado: (estado: "todos" | "aprobado" | "pendiente" | "rechazado") => void;
  search: string;
  setSearch: (v: string) => void;
}

const ClientsFiltersBar: React.FC<ClientsFiltersBarProps> = ({
  tipo, setTipo, estado, setEstado, search, setSearch
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 w-full">
    {/* Tabs para tipo de cliente */}
    <Tabs defaultValue={tipo} className="w-full md:w-auto">
      <TabsList className="flex w-full md:w-auto bg-white/5 rounded-2xl overflow-x-auto no-scrollbar px-1 py-1">
        <TabsTrigger
          value="todos"
          className="data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A] min-w-[100px] flex-1"
          onClick={() => setTipo("todos")}
          style={{ fontFamily: "Helvetica" }}
        >
          <Users size={18} className="mr-1" /> Todos
        </TabsTrigger>
        <TabsTrigger
          value="empresa"
          className="data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A] min-w-[100px] flex-1"
          onClick={() => setTipo("empresa")}
          style={{ fontFamily: "Helvetica" }}
        >
          <UserSquare size={18} className="mr-1" /> Empresas
        </TabsTrigger>
        <TabsTrigger
          value="persona"
          className="data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A] min-w-[130px] flex-1"
          onClick={() => setTipo("persona")}
          style={{ fontFamily: "Helvetica" }}
        >
          <Users size={18} className="mr-1" /> Personas
        </TabsTrigger>
      </TabsList>
    </Tabs>
    {/* Dropdown para estado */}
    <div className="w-full md:w-56">
      <select
        className="w-full rounded-2xl bg-white/10 border-white/20 text-white p-2.5 text-sm font-medium focus:outline-none"
        value={estado}
        onChange={e => setEstado(e.target.value as any)}
      >
        <option value="todos">Estado: Todos</option>
        <option value="aprobado">Aprobado</option>
        <option value="pendiente">Pendiente</option>
        <option value="rechazado">Rechazado</option>
      </select>
    </div>
    {/* Buscador */}
    <Input
      className="w-full md:w-72 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60"
      placeholder="Buscar por nombre o correo..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={{ fontFamily: "Helvetica" }}
    />
  </div>
);

export default ClientsFiltersBar;
