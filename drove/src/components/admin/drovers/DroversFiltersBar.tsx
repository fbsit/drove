
import React from "react";
import { Input } from "@/components/ui/input";

interface Props {
  estado: "todos" | "aprobado" | "pendiente" | "rechazado";
  setEstado: (estado: "todos" | "aprobado" | "pendiente" | "rechazado") => void;
  search: string;
  setSearch: (v: string) => void;
  tipoDrover: "todos" | "core" | "flex";
  setTipoDrover: (v: "todos" | "core" | "flex") => void;
}

const DroversFiltersBar: React.FC<Props> = ({
  estado, setEstado, search, setSearch, tipoDrover, setTipoDrover
}) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between mb-6 w-full">
    {/* Dropdown de estado */}
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
    {/* Dropdown tipo drover */}
    <div className="w-full md:w-56">
      <select
        className="w-full rounded-2xl bg-white/10 border-white/20 text-white p-2.5 text-sm font-medium focus:outline-none"
        value={tipoDrover}
        onChange={e => setTipoDrover(e.target.value as any)}
      >
        <option value="todos">Tipo de DROVER: Todos</option>
        <option value="core">DROVER Core</option>
        <option value="flex">DROVER Flex</option>
      </select>
    </div>
    {/* Buscador */}
    <Input
      className="w-full md:w-72 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60"
      placeholder="Buscar por nombre o correo..."
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
  </div>
);

export default DroversFiltersBar;
