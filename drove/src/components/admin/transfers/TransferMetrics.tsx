
import React from 'react';
import { Clock, Check, AlertCircle, UserCheck } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface TransferMetricsProps {
  totalTransfers: number;
  inProgressCount: number;
  completedCount: number;
  pendingCount: number;
  assignedCount: number;
}

const TransferMetrics: React.FC<TransferMetricsProps> = ({
  totalTransfers,
  inProgressCount,
  completedCount,
  pendingCount,
  assignedCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
      <Card className="bg-white/10 border-0 text-white col-span-2 md:col-span-1">
        <CardHeader className="pb-2 md:pb-2 px-3 md:px-6 py-3 md:py-6">
          <CardDescription className="text-white/70 text-xs md:text-sm">Total Traslados</CardDescription>
          <CardTitle className="text-2xl md:text-3xl font-bold">{totalTransfers}</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="bg-white/10 border-0 text-white">
        <CardHeader className="pb-2 md:pb-2 px-3 md:px-6 py-3 md:py-6">
          <CardDescription className="text-white/70 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-[#6EF7FF]" />
            <span className="hidden md:inline">En Progreso</span>
            <span className="md:hidden">Progreso</span>
          </CardDescription>
          <CardTitle className="text-2xl md:text-3xl font-bold">{inProgressCount}</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="bg-white/10 border-0 text-white">
        <CardHeader className="pb-2 md:pb-2 px-3 md:px-6 py-3 md:py-6">
          <CardDescription className="text-white/70 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Check className="h-3 w-3 md:h-4 md:w-4 text-[#6EF7FF]" />
            <span className="hidden md:inline">Completados</span>
            <span className="md:hidden">Finalizados</span>
          </CardDescription>
          <CardTitle className="text-2xl md:text-3xl font-bold">{completedCount}</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="bg-white/10 border-0 text-white">
        <CardHeader className="pb-2 md:pb-2 px-3 md:px-6 py-3 md:py-6">
          <CardDescription className="text-white/70 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-[#6EF7FF]" />
            Asignados
          </CardDescription>
          <CardTitle className="text-2xl md:text-3xl font-bold">{assignedCount}</CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="bg-white/10 border-0 text-white">
        <CardHeader className="pb-2 md:pb-2 px-3 md:px-6 py-3 md:py-6">
          <CardDescription className="text-white/70 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-[#6EF7FF]" />
            Pendientes
          </CardDescription>
          <CardTitle className="text-2xl md:text-3xl font-bold">{pendingCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default TransferMetrics;
