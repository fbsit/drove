
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
  UserCheck,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TransfersTable from "@/components/admin/transfers/TransfersTable";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardAdminPanel: React.FC = () => {
  const {
    metrics,
    recentTransfers,
    pendingUsers,
    pendingPayments,
    pendingInvoices,
    isLoading
  } = useAdminDashboard();

  console.log('Dashboard Admin - Datos cargados:', {
    metrics,
    recentTransfers,
    pendingUsers: pendingUsers?.length,
    pendingPayments: pendingPayments?.length,
    pendingInvoices: pendingInvoices?.length
  });

  if (isLoading) {
    return (
      <div className="flex flex-col w-full space-y-6 md:space-y-8 pt-20">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando datos del dashboard...</span>
        </div>
      </div>
    );
  }

  console.log("estas son las metrics",metrics);

  return (
    <div className="flex flex-col w-full space-y-6 md:space-y-8 pt-16">
      {/* Header + Título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 md:mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Helvetica", letterSpacing: "-0.03em" }}>
            Panel de Administración
          </h1>
          <p className="text-white/70">
            Bienvenido al centro de control de Drove
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/traslados">
              Ver Todos los Traslados
            </Link>
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 animate-fade-in">
        <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-5 md:p-6 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-[#6EF7FF]/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-[#6EF7FF]" />
              </div>
              <span className="text-white/60 text-xs">Total</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
                {metrics?.transfers.total}
              </h3>
              <p className="text-white/70 text-xs md:text-sm">Traslados registrados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-5 md:p-6 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-white/60 text-xs">Completados</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
                {metrics?.completedTransfers}
              </h3>
              <p className="text-white/70 text-xs md:text-sm">Traslados finalizados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-5 md:p-6 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-white/60 text-xs">En progreso</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
                {metrics?.inProgressTransfers}
              </h3>
              <p className="text-white/70 text-xs md:text-sm">Traslados activos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-5 md:p-6 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-white/60 text-xs">Asignados</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
                {metrics?.assignedTransfers}
              </h3>
              <p className="text-white/70 text-xs md:text-sm">Listos para iniciar</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2 md:col-span-3 lg:col-span-1">
          <CardContent className="p-5 md:p-6 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-400" />
              </div>
              <span className="text-white/60 text-xs">Pendientes</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "Helvetica" }}>
                {metrics?.pendingTransfers}
              </h3>
              <p className="text-white/70 text-xs md:text-sm">Esperando asignación</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      {(metrics?.pendingUsersCount > 0 || metrics?.pendingPaymentsCount > 0 || metrics?.pendingInvoicesCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {metrics?.pendingUsersCount > 0 && (
            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-orange-400" />
                  <div>
                    <p className="text-orange-400 font-semibold">{metrics?.pendingUsersCount} usuarios pendientes</p>
                    <p className="text-white/70 text-sm">Requieren aprobación</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {metrics?.pendingPaymentsCount > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Euro className="h-6 w-6 text-red-400" />
                  <div>
                    <p className="text-red-400 font-semibold">{metrics?.pendingPaymentsCount} pagos pendientes</p>
                    <p className="text-white/70 text-sm">Requieren confirmación</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {metrics?.pendingInvoicesCount > 0 && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="text-blue-400 font-semibold">{metrics?.pendingInvoicesCount} facturas pendientes</p>
                    <p className="text-white/70 text-sm">Requieren emisión</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* BLOQUE: Resumen de Ingresos y Accesos rápidos (alturas iguales) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full items-stretch animate-fade-in">
        <div className="lg:col-span-2">
          <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span style={{ fontFamily: "Helvetica" }}>Resumen de Ingresos</span>
                <Euro className="h-6 w-6 text-[#6EF7FF]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Total facturado este mes:</span>
                <span className="text-2xl font-bold text-[#6EF7FF]" style={{ fontFamily: "Helvetica" }}>
                  {metrics?.reviews?.total?.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Promedio por traslado:</span>
                <span className="text-lg font-semibold text-white" style={{ fontFamily: "Helvetica" }}>
                  {metrics?.reviews.average > 0 ? metrics?.reviews.average.toFixed(2) : '0.00'} €
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                <div 
                  className="bg-[#6EF7FF] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metrics?.completedTransfers / Math.max(metrics?.totalTransfers, 1)) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-white/60 text-sm">
                {metrics?.totalTransfers > 0 ? ((metrics?.completedTransfers / metrics?.totalTransfers) * 100).toFixed(1) : "0"}% de traslados completados
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span style={{ fontFamily: "Helvetica" }}>Accesos Rápidos</span>
              <BarChart3 className="h-6 w-6 text-[#6EF7FF]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col">
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
          </CardContent>
        </Card>
      </div>

      {/* Separador visual */}
      <div className="border-b border-white/10 mx-1" />

      {/* Traslados recientes */}
      <Card className="bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span style={{ fontFamily: "Helvetica" }}>Traslados Recientes</span>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#6EF7FF]" />
              <Button variant="link" size="sm" asChild>
                <Link to="/admin/traslados" className="text-[#6EF7FF]">
                  Ver todos
                </Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransfersTable transfers={recentTransfers} gamify={true} />
          {recentTransfers?.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No hay traslados recientes disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensaje motivacional */}
      <Card className="bg-gradient-to-r from-[#6EF7FF]/20 to-[#6EF7FF]/10 border-[#6EF7FF]/30 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#6EF7FF]/20 p-3 rounded-xl">
              <Trophy className="h-8 w-8 text-[#6EF7FF] animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Helvetica" }}>
                ¡Excelente trabajo!
              </h3>
              <p className="text-white/80">
                La plataforma está funcionando correctamente. {metrics?.completedTransfers} traslados completados con éxito.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAdminPanel;
