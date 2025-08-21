
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBillingManagement } from "@/hooks/admin/useBillingManagement";

const Facturacion: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [method, setMethod] = useState("todos");

  const { 
    pendingPayments, 
    pendingInvoices, 
    allInvoices, 
    isLoading, 
    confirmPayment, 
    issueInvoice,
    isConfirmingPayment,
    isIssuingInvoice 
  } = useBillingManagement();

  // Combinar todos los elementos de facturación
  const allBillingItems = [
    ...pendingPayments,
    ...pendingInvoices,
    ...allInvoices
  ];

  // Filtrar elementos
  const filteredItems = allBillingItems.filter(item => {
    const matchesSearch = item.client?.toLowerCase().includes(search.toLowerCase()) ||
                         item.transferId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || item.invoiceStatus === statusFilter;
    const matchesMethod = method === "todos" || item.method === method;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calcular métricas
  const metrics = {
    totalPayments: pendingPayments.length,
    totalInvoices: allInvoices.length,
    pendingInvoices: pendingInvoices.length,
    totalRevenue: allBillingItems
      .filter(item => item.invoiceStatus === 'emitida')
      .reduce((sum, item) => sum + item.amount, 0),
  };

  const handleConfirmPayment = (paymentId: string) => {
    confirmPayment(paymentId);
  };

  const handleEmitInvoice = (invoiceId: string) => {
    issueInvoice(invoiceId);
  };

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando facturación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          Gestión de Facturación
        </h1>
        <p className="text-white/70">
          Administra pagos pendientes, emite facturas y supervisa el estado financiero de los traslados.
        </p>
        
        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{metrics.totalPayments}</div>
            <div className="text-sm text-white/60">Pagos Pendientes</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{metrics.pendingInvoices}</div>
            <div className="text-sm text-white/60">Facturas Pendientes</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{metrics.totalInvoices}</div>
            <div className="text-sm text-white/60">Total Facturas</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#6EF7FF]">€{metrics.totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-white/60">Ingresos Totales</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="emitida">Emitida</option>
          <option value="no_emitida">No Emitida</option>
          <option value="pagada">Pagada</option>
        </select>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="todos">Todos los métodos</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {/* Lista de elementos de facturación */}
      <div className="space-y-4">
        {filteredItems.map((billing) => (
          <Card key={`${billing.type}-${billing.transferId || billing.id}`} className="bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">Traslado #{billing.transferId}</CardTitle>
                  <p className="text-white/60 text-sm">{billing.client}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#6EF7FF]">€{billing.amount.toFixed(2)}</div>
                  <div className="text-sm text-white/60">{billing.method}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80">Estado: {billing.invoiceStatus}</p>
                  <p className="text-white/60 text-sm">Fecha: {new Date(billing.paymentDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {billing.type === 'payment' && (
                    <Button
                      size="sm"
                      onClick={() => handleConfirmPayment(billing.id)}
                      disabled={isConfirmingPayment}
                      className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A]"
                    >
                      {isConfirmingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Pago"}
                    </Button>
                  )}
                  {billing.invoiceStatus === 'no_emitida' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEmitInvoice(billing.transferId || billing.id)}
                      disabled={isIssuingInvoice}
                    >
                      {isIssuingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Emitir Factura"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No se encontraron elementos de facturación</p>
          <p className="text-white/50 text-sm mt-2">
            Ajusta los filtros para encontrar los elementos que buscas
          </p>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
