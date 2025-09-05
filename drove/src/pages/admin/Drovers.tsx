// src/pages/admin/Drovers.tsx
import React, { useState } from "react";
import { Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DroversTabs from "@/components/admin/drovers/DroversTabs";
import { useDroversManagement } from "@/hooks/admin/useDroversManagement";
import { UserStatus } from "@/constants/enums"; // PENDING | APPROVED | REJECTED

/* ---------- helpers ---------- */

// búsqueda profunda en cualquier campo
const contains = (obj: unknown, term: string): boolean => {
  if (!term) return true;
  const q = term.toLowerCase();

  const walk = (val: any): boolean => {
    if (val == null) return false;

    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean"
    ) {
      return val.toString().toLowerCase().includes(q);
    }
    if (Array.isArray(val)) return val.some(walk);
    if (typeof val === "object") return Object.values(val).some(walk);

    return false;
  };

  return walk(obj);
};

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: UserStatus.PENDING, label: "Pendientes" },
  { value: UserStatus.APPROVED, label: "Aprobados" },
  { value: UserStatus.REJECTED, label: "Rechazados" },
] as const;

const colorClasses: Record<string, string> = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  white: "text-white",
};

/* ---------- componente ---------- */

const Drovers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [typeFilter, setTypeFilter] = useState<'todos' | 'core' | 'flex'>("todos");

  const {
    drovers = [],
    isLoading,
    approveDrover,
    rejectDrover,
    isApproving,
    isRejecting,
  } = useDroversManagement();

  // filtro combinado texto + estado
  const filteredDrovers = drovers.filter((d) => {
    const matchesSearch = contains(d, search);
    const matchesStatus = statusFilter === "todos" || d.status === statusFilter;
    const inferredType: 'core' | 'flex' = d.company_name ? 'core' : 'flex';
    const matchesType = typeFilter === 'todos' || inferredType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading)
    return (
      <div className=" flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
        <span className="ml-2 text-white">Cargando drovers…</span>
      </div>
    );

  return (
    <div className="">
      <h1
        className="text-2xl font-bold text-white mb-1"
        style={{ fontFamily: "Helvetica" }}
      >
        Gestión de Drovers
      </h1>
      <p className="text-white/70 mb-4">
        Administra y gestiona todos los drovers registrados en la plataforma.
      </p>

      {/* Filtros arriba de los tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
            <SelectValue placeholder="Estado: Todos" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                Estado: {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
            <SelectValue placeholder="Tipo de DROVER: Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Tipo de Drover: Todos</SelectItem>
            <SelectItem value="core">Tipo de DROVER: Core</SelectItem>
            <SelectItem value="flex">Tipo de DROVER: Flex</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
        />
      </div>

      {/* Tabs: Fichas | Mapa */}
      <DroversTabs drovers={filteredDrovers} />

      {filteredDrovers.length === 0 && <EmptyState msg="No se encontraron drovers" />}
    </div>
  );
};

/* ---------- sub‑componentes ---------- */

const Metric = ({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: number;
  color?: "green" | "yellow" | "red" | "white";
}) => (
  <div className="bg-white/10 rounded-lg p-4 text-center">
    <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
    <div className="text-sm text-white/60">{label}</div>
  </div>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="text-center py-12">
    <Users className="h-12 w-12 text-white/30 mx-auto mb-3" />
    <p className="text-white/70 text-lg">{msg}</p>
    <p className="text-white/50 text-sm mt-2">
      Ajusta los filtros para encontrar los drovers que buscas
    </p>
  </div>
);

export default Drovers;
