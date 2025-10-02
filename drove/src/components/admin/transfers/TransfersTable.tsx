import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from './StatusBadge';
import { Button } from "@/components/ui/button";
import { Car, User, Calendar, MapPin, ArrowRight, Trophy, Zap, AlertCircle, Eye, ChevronDown, ChevronRight, UserCheck, RefreshCcw, MoreHorizontal } from 'lucide-react';
import TransferCard from "./TransferCard";
import { useState } from 'react';
import RescheduleModal from './RescheduleModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransferStatus } from "@/services/api/types/transfers";

interface TransfersTableProps {
  transfers: any[];
  gamify?: boolean;
  showOnlyDrover?: boolean;
  showOnlyClient?: boolean;
}

const getGamifyIcon = (status: string) => {
  if (status === 'completado') return <Trophy className="text-green-400" size={18} />;
  if (status === 'en_progreso') return <Zap className="text-blue-400" size={18} />;
  if (status === 'pendiente') return <Calendar className="text-amber-400" size={18} />;
  return <AlertCircle className="text-red-400" size={18} />;
};

const TransfersTable: React.FC<TransfersTableProps> = ({
  transfers = [],
  gamify = false,
  showOnlyDrover = false,
  showOnlyClient = false,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedTransferForReschedule, setSelectedTransferForReschedule] = useState<any>(null);

  const parseLocalDate = (dateStr?: string, timeStr?: string): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    // yyyy-mm-dd
    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    let h = 0, mi = 0;
    if (typeof timeStr === 'string') {
      const mt = timeStr.match(/^(\d{2}):(\d{2})/);
      if (mt) { h = Number(mt[1]); mi = Number(mt[2]); }
    }
    // Construye fecha en zona local para evitar offset UTC (-X hrs) que adelanta/atrasa el día
    return new Date(y, mo - 1, d, h, mi, 0, 0);
  };

  const getPreferredDate = (transfer: any): Date | null => {
    // 1) travelDate (+ travelTime) guardado como strings
    const byTravel = parseLocalDate(transfer?.travelDate, transfer?.travelTime);
    if (byTravel) return byTravel;
    // 2) scheduledDate si existe
    const sched = typeof transfer?.scheduledDate === 'string'
      ? (parseLocalDate(transfer.scheduledDate, transfer.scheduledTime) || new Date(transfer.scheduledDate))
      : (transfer?.scheduledDate instanceof Date ? transfer.scheduledDate : null);
    if (sched) return sched;
    // 3) createdAt/created_at
    const created = transfer?.createdAt || transfer?.created_at;
    if (created) {
      if (typeof created === 'string' || typeof created === 'number') {
        const d = new Date(created); return isNaN(d.getTime()) ? null : d;
      }
      if (created instanceof Date) return created;
    }
    return null;
  };

  const formatDate = (dateInput: any) => {
    if (!dateInput) return '—';
    try {
      // Acepta Date, ISO string, timestamp o campos pickup_details
      let date: Date;
      if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'object') {
        const val = (dateInput as any).createdAt || (dateInput as any).created_at || null;
        date = val ? new Date(val) : new Date();
      } else {
        return '—';
      }
      if (isNaN(date.getTime())) return '—';
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return '—';
    }
  };

  const formatDateParts = (dateInput: any): { top: string; bottom: string } => {
    if (!dateInput) return { top: '—', bottom: '' };
    try {
      let date: Date;
      if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'object') {
        const val = (dateInput as any).createdAt || (dateInput as any).created_at || null;
        date = val ? new Date(val) : new Date();
      } else {
        return { top: '—', bottom: '' };
      }
      if (isNaN(date.getTime())) return { top: '—', bottom: '' };
      const top = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })
        .format(date)
        .replace('.', '');
      const bottom = new Intl.DateTimeFormat('es-ES', { year: 'numeric' }).format(date);
      return { top, bottom };
    } catch {
      return { top: '—', bottom: '' };
    }
  };

  const formatDatePartsFromTransfer = (transfer: any): { top: string; bottom: string } => {
    const pref = getPreferredDate(transfer);
    if (!pref) return { top: '—', bottom: '' };
    const top = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })
      .format(pref)
      .replace('.', '');
    const bottom = new Intl.DateTimeFormat('es-ES', { year: 'numeric' }).format(pref);
    return { top, bottom };
  };

  const toggleRow = (transferId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transferId)) {
      newExpanded.delete(transferId);
    } else {
      newExpanded.add(transferId);
    }
    setExpandedRows(newExpanded);
  };

  const handleRescheduleClick = (transfer: any) => {
    setSelectedTransferForReschedule(transfer);
    setShowRescheduleModal(true);
  };

  // En móvil (< 768px) mostramos cards
  return (
    <>
      {/* Vista móvil - Cards */}
      <div className="block xl:hidden">
        {transfers.length === 0 ? (
          <div className="text-center text-white py-8">No hay traslados disponibles</div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 lg:gap-x-[2%]">
            {transfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} gamify={gamify} />
            ))}
          </div>
        )}
      </div>

      {/* Vista desktop - Tabla moderna y expandible */}
      <div className="hidden xl:block">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/10 hover:bg-white/5 border-b border-white/10">
                <TableHead className="text-white font-medium w-10"></TableHead>
                {gamify && <TableHead className="text-white font-medium w-10"></TableHead>}
                <TableHead className="text-white font-medium">Estado</TableHead>
                <TableHead className="text-white font-medium">Cliente</TableHead>
                <TableHead className="text-white font-medium">Fecha</TableHead>
                <TableHead className="text-white font-medium text-right">Precio</TableHead>
                <TableHead className="text-white font-medium text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-white">
                    No hay traslados disponibles
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => {
                  const isCompleted = transfer.status === TransferStatus.DELIVERED;
                  const isAssigned = transfer.status === TransferStatus.ASSIGNED;
                  const isInProgress = transfer.status === TransferStatus.IN_PROGRESS;
                  const isCreated = transfer.status === TransferStatus.CREATED;
                  const isPendingPaid = transfer.status === TransferStatus.PENDINGPAID;
                  const assignedDriver = transfer.droverName || transfer.drivers?.full_name;
                  const isExpanded = expandedRows.has(transfer.id);
                  const shouldShowAssignButton = !isCompleted && !isAssigned && !isInProgress;
                  const canReschedule = (isCreated || isAssigned || isPendingPaid) && !isCompleted;

                  return (
                    <React.Fragment key={transfer.id}>
                      {/* Fila principal */}
                      <TableRow
                        className="border-t border-white/10 hover:bg-white/10 transition-all cursor-pointer group h-[72px]"
                        onClick={() => toggleRow(transfer.id)}
                      >
                        {/* Botón expandir/contraer */}
                        <TableCell className="w-10 py-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-white/70 hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </Button>
                        </TableCell>

                        {gamify && (
                          <TableCell className="w-10">
                            {getGamifyIcon(transfer.status)}
                          </TableCell>
                        )}

                        <TableCell className="py-5">
                          <StatusBadge status={transfer.status} />
                        </TableCell>

                        <TableCell className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#6EF7FF]/10 flex items-center justify-center flex-shrink-0">
                              <User size={14} className="text-[#6EF7FF]" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="font-medium text-white truncate">
                                {transfer.clientName || transfer.users?.company_name || transfer.users?.full_name}
                              </p>
                              <p className="text-xs text-white/70 truncate">
                                {transfer.clientEmail || transfer.users?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-5">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-white/70" />
                            {(() => {
                              const p = formatDatePartsFromTransfer(transfer); return (
                                <div className="leading-tight">
                                  <div className="text-white text-sm">{p.top}</div>
                                  <div className="text-white/60 text-xs">{p.bottom}</div>
                                </div>
                              );
                            })()}
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-5">
                          <span className="text-base font-bold text-[#6EF7FF] whitespace-nowrap">
                            {Number(transfer.totalPrice ?? transfer.price ?? 0).toFixed(2)} €
                          </span>
                        </TableCell>

                        <TableCell className="text-right py-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center space-x-2">
                            {/* Mostrar nombre del drover para traslados completados, asignados o en progreso */}
                            {(isCompleted || isAssigned || isInProgress) && assignedDriver && (
                              <span className={`text-white/90 text-xs px-2 py-1 rounded-full whitespace-nowrap ${isCompleted ? 'bg-green-500/20' :
                                isInProgress ? 'bg-blue-500/20' :
                                  'bg-purple-500/20'
                                }`}>
                                {assignedDriver}
                              </span>
                            )}

                            {/* Botón Asignar Drover si NO está completado, NO está asignado y NO está en progreso */}
                            {shouldShowAssignButton && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#6EF7FF] text-[#6EF7FF] hover:bg-[#6EF7FF] hover:text-[#22142A] text-xs rounded-full px-3"
                                asChild
                              >
                                <Link to={`/admin/asignar/${transfer.id}`}>Asignar</Link>
                              </Button>
                            )}

                            {/* Dropdown de acciones */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/70 hover:text-white hover:bg-white/10"
                                >
                                  <MoreHorizontal size={18} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-[#22142A] border-white/20">
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/traslados/activo/${transfer.id}`}
                                    className="flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer"
                                  >
                                    <Eye size={16} />
                                    Ver Detalle
                                  </Link>
                                </DropdownMenuItem>

                                {canReschedule && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRescheduleClick(transfer);
                                    }}
                                    className="flex items-center gap-2 text-purple-400 hover:bg-purple-400/10 cursor-pointer"
                                  >
                                    <Calendar size={16} />
                                    Reprogramar
                                  </DropdownMenuItem>
                                )}

                                {isAssigned && (
                                  <DropdownMenuItem asChild>
                                      <Link
                                        to={`/admin/reasignar/${transfer.id}`}
                                        className="flex items-center gap-2 text-orange-400 hover:bg-orange-400/10 cursor-pointer"
                                      >
                                        <RefreshCcw size={16} />
                                        Reasignar Drover
                                      </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Fila expandida con detalles */}
                      {isExpanded && (
                        <TableRow className="border-t border-white/5">
                          <TableCell colSpan={gamify ? 7 : 6} className="bg-white/5 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Detalles del vehículo */}
                              <div className="space-y-4">
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Car size={18} className="text-[#6EF7FF]" />
                                  Detalles del Vehículo
                                </h4>
                                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                  <p className="text-white">
                                    <span className="text-white/70">Marca y Modelo:</span>{" "}
                                    <span className="font-medium">
                                      {transfer.brand || '—'} {transfer.model || ''}
                                    </span>
                                  </p>
                                  <p className="text-white">
                                    <span className="text-white/70">Matrícula:</span>{" "}
                                    <span className="font-medium">{transfer.licensePlate || '—'}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Detalles de la ruta */}
                              <div className="space-y-4">
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <MapPin size={18} className="text-[#6EF7FF]" />
                                  Detalles de la Ruta
                                </h4>
                                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0"></div>
                                    <div>
                                      <p className="text-xs text-white/70 uppercase tracking-wide">Origen</p>
                                      <p className="text-white text-sm">{transfer.origin || '—'}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 pl-1">
                                    <div className="w-1 h-8 bg-white/20 rounded-full"></div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-400 mt-1 flex-shrink-0"></div>
                                    <div>
                                      <p className="text-xs text-white/70 uppercase tracking-wide">Destino</p>
                                      <p className="text-white text-sm">{transfer.destination || '—'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de reprogramación */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedTransferForReschedule(null);
        }}
        transferId={selectedTransferForReschedule?.id || ''}
        currentDate={selectedTransferForReschedule?.pickup_details?.pickupDate}
        currentTime={selectedTransferForReschedule?.pickup_details?.pickupTime}
      />
    </>
  );
};

export default TransfersTable;
