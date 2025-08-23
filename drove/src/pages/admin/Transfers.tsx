
import React, { useState } from "react";
import TransferFilters from "@/components/admin/transfers/TransferFilters";
import TransferMetrics from "@/components/admin/transfers/TransferMetrics";
import TransfersTable from "@/components/admin/transfers/TransfersTable";
import RescheduleModal from "@/components/admin/transfers/RescheduleModal";
import { useTransfersManagement } from "@/hooks/admin/useTransfersManagement";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TransferStatus } from "@/services/api/types/transfers";

const Transfers: React.FC = () => {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});
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
    isAssigningDriver,
    isUpdatingStatus 
  } = useTransfersManagement({ search: debouncedSearch, status: statusFilter, from: dateRange.from, to: dateRange.to });

  // Server-side filtering, no filtro local: mostramos directamente transfers
  const filteredTransfers = transfers;

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
      <div className="admin-page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando traslados...</span>
        </div>
      </div>
    );
  }
  

  return (
    <div className="admin-page-container">
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          Gestión de Traslados
        </h1>
        <p className="text-white/70">
          Administra todos los traslados de vehículos, asigna drovers y supervisa el estado de cada operación.
        </p>
      </div>

      {/* Métricas */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics?.totalTransfers}</div>
          <div className="text-sm text-white/60">Total Traslados</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{metrics?.completedTransfers}</div>
          <div className="text-sm text-white/60">Entregados</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{metrics?.inProgressTransfers}</div>
          <div className="text-sm text-white/60">En Progreso</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{metrics?.pendingTransfers}</div>
          <div className="text-sm text-white/60">Pendientes</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar traslados..."
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
          <option value={TransferStatus.PENDINGPAID}>Pendiente de Pago</option>
          <option value={TransferStatus.CREATED}>Creado</option>
          <option value={TransferStatus.ASSIGNED}>Drover Asignado</option>
          <option value={TransferStatus.PICKED_UP}>Vehículo Recogido</option>
          <option value={TransferStatus.IN_PROGRESS}>En Progreso</option>
          <option value={TransferStatus.REQUEST_FINISH}>Solicitando Entrega</option>
          <option value={TransferStatus.DELIVERED}>Entregado</option>
          <option value={TransferStatus.CANCELLED}>Cancelado</option>
        </select>
      </div>

      {/* Lista de traslados */}
      <div className="space-y-4">
        {filteredTransfers.map((transfer) => (
          <div key={transfer.id} className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold">#{transfer?.id}</h3>
                <p className="text-white/70">{transfer?.clientName} - {transfer?.clientEmail}</p>
                <p className="text-white/60 text-sm">{transfer?.origin} → {transfer?.destination}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#6EF7FF]">€{transfer?.price}</div>
                <div className="text-sm text-white/60">{transfer?.vehicleType}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className={`px-2 py-1 rounded text-xs ${
                  transfer.status === TransferStatus.DELIVERED ? 'bg-green-500 text-white' :
                  transfer.status === TransferStatus.IN_PROGRESS ? 'bg-purple-500 text-white' :
                  transfer.status === TransferStatus.ASSIGNED ? 'bg-indigo-500 text-white' :
                  transfer.status === TransferStatus.PICKED_UP ? 'bg-orange-500 text-white' :
                  transfer.status === TransferStatus.CREATED ? 'bg-blue-500 text-white' :
                  transfer.status === TransferStatus.PENDINGPAID ? 'bg-yellow-500 text-black' :
                  transfer.status === TransferStatus.REQUEST_FINISH ? 'bg-amber-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {getStatusText(transfer.status)}
                </span>
              </div>
              <div className="flex gap-2">
                {transfer.status === TransferStatus.CREATED && (
                  <button
                    onClick={() => handleAssignDriver(transfer.id, transfer.droverId)}
                    disabled={isAssigningDriver}
                    className="px-3 py-1 bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] rounded text-sm"
                  >
                    {isAssigningDriver ? 'Asignando...' : 'Asignar Drover'}
                  </button>
                )}
                {(transfer.status === TransferStatus.ASSIGNED || transfer.status === TransferStatus.CREATED ) && (
                  <button
                    onClick={() => handleReschedule(transfer.id)}
                    className="px-3 py-1 bg-purple-400 hover:bg-purple-500 text-white rounded text-sm"
                  >
                    Reprogramar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTransfers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No se encontraron traslados</p>
          <p className="text-white/50 text-sm mt-2">
            Ajusta los filtros para encontrar los traslados que buscas
          </p>
        </div>
      )}

      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        transferId={selectedTransferId}
      />
    </div>
  );
};

export default Transfers;
