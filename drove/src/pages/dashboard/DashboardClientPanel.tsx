
import React from "react";

const DashboardClientPanel: React.FC = () => (
  <section className="p-8 text-white">
    <div className="max-w-[880px] mx-auto">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Helvetica" }}>Panel principal - Cliente</h1>
      <div className="bg-white/10 rounded-2xl p-8 text-white/70">
        Aquí podrás ver un resumen de tus traslados, pagos y notificaciones.
      </div>
    </div>
  </section>
);

export default DashboardClientPanel;
