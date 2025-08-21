
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Euro, CreditCard, Building2 } from "lucide-react";

const description = "Supervisa todos los pagos recibidos en DROVE. Gestiona estados, métodos de pago y genera reportes financieros.";

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "completado" | "pendiente" | "fallido">("todos");
  const [methodFilter, setMethodFilter] = useState<"todos" | "tarjeta" | "transferencia">("todos");

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "todos" || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "completado":
        return <Badge className="bg-green-600 text-white">Completado</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-600 text-white">Pendiente</Badge>;
      case "fallido":
        return <Badge className="bg-red-600 text-white">Fallido</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    return method === "tarjeta" ? <CreditCard size={16} /> : <Building2 size={16} />;
  };

  return (
    <div className="admin-page-container">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
            Gestión de Pagos
          </h1>
          <p className="text-white/70">{description}</p>
        </div>
        <Button variant="outline" className="border-[#6EF7FF] text-[#6EF7FF] hover:bg-[#6EF7FF] hover:text-[#22142A]">
          <Download size={20} className="mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <Input
            placeholder="Buscar por cliente o ID de pago..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 rounded-2xl bg-white/10 border-white/20 text-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="completado">Completado</option>
          <option value="pendiente">Pendiente</option>
          <option value="fallido">Fallido</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as any)}
          className="px-4 py-2 rounded-2xl bg-white/10 border-white/20 text-white"
        >
          <option value="todos">Todos los métodos</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {/* Lista de pagos */}
      <div className="bg-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="text-left p-4 text-white font-bold">ID Pago</th>
                <th className="text-left p-4 text-white font-bold">Cliente</th>
                <th className="text-left p-4 text-white font-bold">Importe</th>
                <th className="text-left p-4 text-white font-bold">Método</th>
                <th className="text-left p-4 text-white font-bold">Estado</th>
                <th className="text-left p-4 text-white font-bold">Fecha</th>
                <th className="text-left p-4 text-white font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white font-mono text-sm">{payment.id}</td>
                  <td className="p-4 text-white font-medium">{payment.clientName}</td>
                  <td className="p-4 text-white font-bold">
                    <div className="flex items-center">
                      <Euro size={16} className="mr-1" />
                      {payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex items-center">
                      {getMethodIcon(payment.method)}
                      <span className="ml-2 capitalize">{payment.method}</span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(payment.status)}</td>
                  <td className="p-4 text-white/70 text-sm">
                    {new Date(payment.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" className="text-[#6EF7FF] hover:bg-[#6EF7FF]/20">
                      Ver detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No se encontraron pagos</p>
          <p className="text-white/50 text-sm mt-2">
            Ajusta los filtros para ver más resultados
          </p>
        </div>
      )}
    </div>
  );
};

export default Payments;
