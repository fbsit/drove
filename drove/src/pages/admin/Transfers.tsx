
import React, { useMemo, useState } from "react";
import TransferFilters from "@/components/admin/transfers/TransferFilters";
import TransferMetrics from "@/components/admin/transfers/TransferMetrics";
import TransfersTable from "@/components/admin/transfers/TransfersTable";
import RescheduleModal from "@/components/admin/transfers/RescheduleModal";
import { useTransfersManagement } from "@/hooks/admin/useTransfersManagement";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Invoices from "@/pages/admin/Invoices";
import { TransferStatus } from "@/services/api/types/transfers";

const Transfers: React.FC = () => {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>({});
  const [pendingOnly, setPendingOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string>("");
  const navigate = useNavigate();
  // Usar el hook de gestión de traslados
  const {
    transfers,
    metrics,
    isLoading,
    assignDriver,
    updateTransferStatus,
    isAssigning: isAssigningDriver,
    isUpdating: isUpdatingStatus
  } = useTransfersManagement({ search: debouncedSearch, status: statusFilter, from: dateRange.from, to: dateRange.to });

  // Filtro adicional local si el checkbox de "pendientes" está activo
  const filteredTransfers = useMemo(() => {
    if (!pendingOnly) return transfers;
    return transfers.filter((t: any) => t.status === TransferStatus.CREATED || t.status === TransferStatus.PENDINGPAID);
  }, [transfers, pendingOnly]);

  const handleAssignDriver = (transferId: string, driverId: string) => {
    navigate(`/admin/asignar/${transferId}`);
  };

  const handleUpdateStatus = (transferId: string, status: string) => {
    updateTransferStatus(transferId, status);
  };

  const handleReschedule = (transferId: string) => {
    setSelectedTransferId(transferId);
    setShowRescheduleModal(true);
  };

  const getStatusText = (status: string): string => {
    const statusTexts = {
      [TransferStatus.PENDINGPAID]: 'Pendiente de Pago',
      [TransferStatus.CREATED]: 'Creado',
      [TransferStatus.ASSIGNED]: 'Drover Asignado',
      [TransferStatus.PICKED_UP]: 'Vehículo Recogido',
      [TransferStatus.IN_PROGRESS]: 'En Progreso',
      [TransferStatus.REQUEST_FINISH]: 'Solicitando Entrega',
      [TransferStatus.DELIVERED]: 'Entregado',
      [TransferStatus.CANCELLED]: 'Cancelado'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  if (isLoading) {
    return (
      <div className="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando traslados...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          Gestión de Traslados
        </h1>
        <p className="text-white/70">
          Administra todos los traslados de vehículos, asigna drovers y supervisa el estado de cada operación.
        </p>
      </div>

      <Tabs defaultValue="operativa" className="w-full">
        <TabsList className="w-full bg-white/10 gap-5 flex rounded-2xl mb-4">
          <TabsTrigger value="operativa" className="flex-1 data-[state=active]:bg-[#6EF7FF] border-transparent border hover:border-white/30 data-[state=active]:text-[#22142A]">Operativa</TabsTrigger>
          <TabsTrigger value="facturacion" className="border-transparent border hover:border-white/30 flex-1 data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A]">Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="operativa">
          <div className="mt-4 flex flex-wrap lg:flex-nowrap gap-x-[4%] gap-y-4 lg:gap-x-4 mb-6 justify-center">
            <div className="bg-white/10 rounded-lg p-8 text-center w-[48%] lg:w-full">
              <div className="text-2xl font-bold text-white">{metrics?.totalTransfers ?? transfers.length}</div>
              <div className="text-sm text-white/60">Total Traslados</div>
            </div>
            <div className="bg-white/10 rounded-lg p-8 text-center w-[48%] lg:w-full">
              <div className="text-2xl font-bold text-green-400">{metrics?.completedTransfers ?? transfers.filter(t => t.status === 'DELIVERED').length}</div>
              <div className="text-sm text-white/60">Entregados</div>
            </div>
            <div className="bg-white/10 rounded-lg p-8 text-center w-[48%] lg:w-full">
              <div className="text-2xl font-bold text-yellow-400">{metrics?.inProgressTransfers ?? transfers.filter(t => t.status === 'IN_PROGRESS').length}</div>
              <div className="text-sm text-white/60">En Progreso</div>
            </div>
            <div className="bg-white/10 rounded-lg p-8 text-center w-[48%] lg:w-full">
              <div className="text-2xl font-bold text-blue-400">{metrics?.pendingTransfers ?? transfers.filter(t => t.status === 'CREATED' || t.status === 'PENDINGPAID').length}</div>
              <div className="text-sm text-white/60">Pendientes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-8 text-center w-[48%] lg:w-full">
              <div className="text-2xl font-bold text-white">{metrics?.assignedTransfers ?? transfers.filter(t => t.status === 'ASSIGNED').length}</div>
              <div className="text-sm text-white/60">Asignados</div>
            </div>
          </div>

          {/* Filtros */}
          <TransferFilters
            searchTerm={search}
            setSearchTerm={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            pendingOnly={pendingOnly}
            setPendingOnly={setPendingOnly}
          />

          {/* Tabla de traslados (desktop) y cards (mobile) */}
          <TransfersTable transfers={filteredTransfers} />
        </TabsContent>

        <TabsContent value="facturacion">
          <Invoices />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Transfers;
