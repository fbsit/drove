
import React from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  Calendar,
  Euro,
  BarChart3,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TransfersTable from "@/components/admin/transfers/TransfersTable";
import mockAdminTransfers from "@/services/mocks/admin_transfers";

const DashboardAdminPanel: React.FC = () => {
  // Usar datos mock
  const { transfers } = mockAdminTransfers();

  // Métricas
  const totalTransfers = transfers.length;
  const completedTransfers = transfers.filter(t => t.status === 'completado').length;
  const inProgressTransfers = transfers.filter(t => t.status === 'en_progreso').length;
  const pendingTransfers = transfers.filter(t => t.status === 'pendiente').length;
  const assignedTransfers = transfers.filter(t => t.status === 'asignado').length;

  const totalRevenue = transfers
    .filter(t => t.status === 'completado')
    .reduce((sum, t) => sum + parseFloat(t.price.toString()), 0);

  const recentTransfers = transfers.slice(0, 5);

  return (
    <div className="flex flex-col w-full space-y-6 md:space-y-8">
      {/* Header + Título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 md:mb-4">
        <div className="w-full text-center md:text-start">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Helvetica", letterSpacing: "-0.03em" }}>
            Panel de Administración
          </h1>
          <p className="text-white/70 ">
            Bienvenido al centro de control de Drove
          </p>
        </div>
        <Button className="mx-auto" variant="outline" size="sm" asChild>
          <Link to="/admin/traslados">
            Ver Todos los Traslados
          </Link>
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
        <div className="bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="bg-[#6EF7FF]/20 p-2 md:p-3 rounded-xl">
              <Car className="h-5 w-5 md:h-6 md:w-6 text-[#6EF7FF] animate-pulse" />
            </div>
            <span className="text-white/60 text-xs md:text-sm">Total</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>{totalTransfers}</h3>
            <p className="text-white/70 text-xs md:text-sm">Traslados registrados</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="bg-green-500/20 p-2 md:p-3 rounded-xl">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-400 animate-pulse" />
            </div>
            <span className="text-white/60 text-xs md:text-sm">Completados</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>{completedTransfers}</h3>
            <p className="text-white/70 text-xs md:text-sm">Traslados finalizados</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="bg-blue-500/20 p-2 md:p-3 rounded-xl">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-400 animate-pulse" />
            </div>
            <span className="text-white/60 text-xs md:text-sm">En progreso</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>{inProgressTransfers}</h3>
            <p className="text-white/70 text-xs md:text-sm">Traslados activos</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="bg-purple-500/20 p-2 md:p-3 rounded-xl">
              <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-purple-400 animate-pulse" />
            </div>
            <span className="text-white/60 text-xs md:text-sm">Asignados</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>{assignedTransfers}</h3>
            <p className="text-white/70 text-xs md:text-sm">Listos para iniciar</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="bg-amber-500/20 p-2 md:p-3 rounded-xl">
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-400 animate-pulse" />
            </div>
            <span className="text-white/60 text-xs md:text-sm">Pendientes</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>{pendingTransfers}</h3>
            <p className="text-white/70 text-xs md:text-sm">Esperando asignación</p>
          </div>
        </div>
      </div>

      {/* BLOQUE: Resumen de Ingresos y Accesos rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full animate-fade-in">
        <div className="lg:col-span-2 bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
              Resumen de Ingresos
            </h2>
            <Euro className="h-6 w-6 text-[#6EF7FF]" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total facturado este mes:</span>
              <span className="text-2xl font-bold text-[#6EF7FF]" style={{ fontFamily: "Helvetica" }}>
                {totalRevenue.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Promedio por traslado:</span>
              <span className="text-lg font-semibold text-white" style={{ fontFamily: "Helvetica" }}>
                {completedTransfers > 0 ? (totalRevenue / completedTransfers).toFixed(2) : '0.00'} €
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-1">
              <div
                className="bg-[#6EF7FF] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((completedTransfers / totalTransfers) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-sm">
              {totalTransfers > 0 ? ((completedTransfers / totalTransfers) * 100).toFixed(1) : "0"}% de traslados completados
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
              Accesos Rápidos
            </h2>
            <BarChart3 className="h-6 w-6 text-[#6EF7FF]" />
          </div>
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="w-full justify-start rounded-2xl" asChild>
              <Link to="/admin/traslados">
                <Car className="h-4 w-4 mr-2" />
                Gestionar Traslados
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start rounded-2xl" asChild>
              <Link to="/admin/drovers">
                <Users className="h-4 w-4 mr-2" />
                Ver Drovers
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start rounded-2xl" asChild>
              <Link to="/admin/clientes">
                <Users className="h-4 w-4 mr-2" />
                Ver Clientes
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start rounded-2xl" asChild>
              <Link to="/admin/reportes">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Reportes
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Separador visual */}
      <div className="border-b border-white/10 mx-1" />

      {/* Traslados recientes */}
      <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in mt-2">
        <div className="flex items-center gap-4 justify-between mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
            Traslados Recientes
          </h2>
          <div className="flex flex-col md:flex-row items-center md:gap-2">
            <Trophy className="h-5 w-5 text-[#6EF7FF]" />
            <Button variant="link" size="sm" asChild>
              <Link to="/admin/traslados" className="text-[#6EF7FF]">
                Ver todos
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabla de traslados recientes */}
        <TransfersTable transfers={recentTransfers} gamify={true} />
      </div>

      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-[#6EF7FF]/20 to-[#6EF7FF]/10 rounded-2xl p-6 border border-[#6EF7FF]/30 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-[#6EF7FF]/20 p-3 rounded-xl">
            <Trophy className="h-8 w-8 text-[#6EF7FF] animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
              ¡Excelente trabajo!
            </h3>
            <p className="text-white/80">
              La plataforma está funcionando correctamente. {completedTransfers} traslados completados con éxito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdminPanel;
