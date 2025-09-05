
import React, { useState } from "react";
import { Loader2, FileText, Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsManagement } from "@/hooks/admin/useReportsManagement";

const Reportes: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState("transfers");

  const {
    reports,
    analytics,
    isLoading,
    generateReport,
    isGeneratingReport
  } = useReportsManagement();

  const handleGenerateReport = () => {
    generateReport(reportType, dateRange);
  };

  if (isLoading) {
    return (
      <div className="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando reportes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          Reportes y Analytics
        </h1>
        <p className="text-white/70">
          Genera reportes detallados y visualiza analytics del rendimiento de la plataforma.
        </p>
      </div>

      {/* Analytics Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Traslados Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.transfers?.total || 0}</div>
            <div className="text-sm text-white/60">
              Completados: {analytics?.transfers?.completed || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#6EF7FF]">€{analytics?.revenue?.total || 0}</div>
            <div className="flex items-center text-sm">
              {(analytics?.revenue?.growth || 0) > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className="text-white/60">
                {Math.abs(analytics?.revenue?.growth || 0).toFixed(1)}% vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Drovers Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.drivers?.active || 0}</div>
            <div className="text-sm text-white/60">
              Total registrados: {analytics?.drivers?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.clients?.total || 0}</div>
            <div className="text-sm text-white/60">
              Nuevos: {analytics?.clients?.new || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generador de Reportes */}
      <Card className="bg-white/10 border-white/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Generar Reporte Personalizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="transfers">Traslados</option>
              <option value="revenue">Ingresos</option>
              <option value="drivers">Drovers</option>
              <option value="clients">Clientes</option>
            </select>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            />
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A]"
          >
            {isGeneratingReport ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generar Reporte
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Reportes Generados */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Reportes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{report.title}</h4>
                    <p className="text-white/60 text-sm">
                      {report.type} - {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70">No hay reportes generados aún</p>
              <p className="text-white/50 text-sm">Genera tu primer reporte usando el formulario anterior</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;
