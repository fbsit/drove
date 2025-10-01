// src/pages/admin/Clients.tsx
import React, { useState } from "react";
import { Loader2, Users, Building2, UserRound } from "lucide-react";
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

/* -------- componente principal -------- */

const Clients: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [typeTab, setTypeTab] = useState<"todos" | "empresa" | "persona">("todos");

  const {
    clients = [],
    isLoading,
    approveClient,
    rejectClient,
    isApproving,
    isRejecting,
  } = useClientsManagement({ type: typeTab, status: statusFilter === 'todos' ? undefined : statusFilter, search });

  const filteredClients = clients.filter((c) => {
    const matchesSearch = contains(c, search);
    const matchesStatus = statusFilter === "todos" || c.status === statusFilter;
    const matchesType = typeTab === 'todos' || c.tipo === typeTab ||
      (typeTab === 'empresa' && (c.accountType === 'COMPANY')) ||
      (typeTab === 'persona' && (c.accountType === 'PERSON'));
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading)
    return (
      <div className=" flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
        <span className="ml-2 text-white">Cargando clientes…</span>
      </div>
    );

  return (
    <div className="">
      <h1
        className="text-2xl font-bold text-white mb-1"
        style={{ fontFamily: "Helvetica" }}
      >
        Gestión de Clientes
      </h1>
      <p className="text-white/70 mb-6">
        Administra los clientes registrados en DROVE, ya sean empresas o personas, aprobando su acceso y gestionando su estado.
      </p>

      {/* tabs de tipo - estilo según referencia */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center w-full gap-5 bg-white/5 rounded-2xl overflow-x-auto no-scrollbar px-1 py-1">
          <button
            className={`inline-flex items-center border-transparent border hover:border-white/30 justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium min-w-[100px] flex-1 rounded-sm transition-all ${typeTab === 'todos' ? 'bg-[#6EF7FF] text-[#22142A] shadow-sm' : 'text-white/70'
              }`}
            onClick={() => setTypeTab('todos')}
            style={{ fontFamily: 'Helvetica' }}
          >
            <Users width={18} height={18} className="mr-1" /> Todos
          </button>
          <button
            className={`inline-flex items-center justify-center border-transparent border hover:border-white/30 whitespace-nowrap px-3 py-1.5 text-sm font-medium min-w-[100px] flex-1 rounded-sm transition-all ${typeTab === 'empresa' ? 'bg-[#6EF7FF] text-[#22142A] shadow-sm' : 'text-white/70'
              }`}
            onClick={() => setTypeTab('empresa')}
            style={{ fontFamily: 'Helvetica' }}
          >
            <Building2 width={18} height={18} className="mr-1" /> Empresas
          </button>
          <button
            className={`inline-flex items-center justify-center whitespace-nowrap border-transparent border hover:border-white/30 px-3 py-1.5 text-sm font-medium min-w-[130px] flex-1 rounded-sm transition-all ${typeTab === 'persona' ? 'bg-[#6EF7FF] text-[#22142A] shadow-sm' : 'text-white/70'
              }`}
            onClick={() => setTypeTab('persona')}
            style={{ fontFamily: 'Helvetica' }}
          >
            <Users width={18} height={18} className="mr-1" /> Personas
          </button>
        </div>

        {/* estado + búsqueda */}
        <div className="flex-1 flex flex-wrap gap-3 justify-end">
          <div className="flex gap-5 w-full">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-2xl h-10">
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
            <Input
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl h-10"
            />
          </div>

        </div>
      </div>

      {/* grid de clientes */}
      <ClientsGrid
        clients={filteredClients}
        onApprove={approveClient}
        onReject={rejectClient}
        isLoading={isApproving || isRejecting}
      />

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/70 text-lg">No se encontraron clientes</p>
          <p className="text-white/50 text-sm mt-2">Ajusta los filtros para encontrar los clientes que buscas</p>
        </div>
      )}
    </div>
  );
};

export default Clients;
