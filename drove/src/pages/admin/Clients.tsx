// src/pages/admin/Clients.tsx
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
import ClientsGrid from "@/components/admin/clients/ClientsGrid";
import { useClientsManagement } from "@/hooks/admin/useClientsManagement";
import { UserStatus } from "@/constants/enums";

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

/* -------- componente principal -------- */

const Clients: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const {
    clients = [],
    isLoading,
    approveClient,
    rejectClient,
    isApproving,
    isRejecting,
  } = useClientsManagement();

  const filteredClients = clients.filter(
    (c) =>
      contains(c, search) &&
      (statusFilter === "todos" || c.status === statusFilter)
  );

  const countByStatus = (s: UserStatus) =>
    clients.filter((c) => c.status === s).length;

  if (isLoading)
    return (
      <div className="admin-page-container flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
        <span className="ml-2 text-white">Cargando clientes…</span>
      </div>
    );

  return (
    <div className="admin-page-container">
      <h1
        className="text-2xl font-bold text-white mb-1"
        style={{ fontFamily: "Helvetica" }}
      >
        Gestión de Clientes
      </h1>
      <p className="text-white/70 mb-4">
        Administra y gestiona todos los clientes registrados en la plataforma.
      </p>

      {/* métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric label="Total" value={clients.length} />
        <Metric
          label="Aprobados"
          value={countByStatus(UserStatus.APPROVED)}
          color="green"
        />
        <Metric
          label="Pendientes"
          value={countByStatus(UserStatus.PENDING)}
          color="yellow"
        />
        <Metric
          label="Rechazados"
          value={countByStatus(UserStatus.REJECTED)}
          color="red"
        />
      </div>

      {/* filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Buscar en cualquier dato del cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* grid de clientes */}
      <ClientsGrid
        clients={filteredClients}
        onApprove={approveClient}
        onReject={rejectClient}
        isLoading={isApproving || isRejecting}
      />

      {filteredClients.length === 0 && (
        <EmptyState msg="No se encontraron clientes" />
      )}
    </div>
  );
};

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
      Ajusta los filtros para encontrar los clientes que buscas
    </p>
  </div>
);

export default Clients;
