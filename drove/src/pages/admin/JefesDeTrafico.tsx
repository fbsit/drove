import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InviteTrafficManagerModal from "./components/InviteTrafficManagerModal";
import EditTrafficManagerModal from "./components/EditTrafficManagerModal";
import TrafficManagerTable from "./components/TrafficManagerTable";
import TrafficManagersSearchBar from "./components/TrafficManagersSearchBar";
import { useTrafficManagerService } from "@/hooks/useTrafficManagerService";

const JefesDeTrafico = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const {
    managers,
    metrics,
    inviteManager,
    updateManager,
    activateManager,
    deactivateManager,
    deleteManager,
    resendInvite,
  } = useTrafficManagerService();

  // Filtrado por búsqueda
  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  // Detecta mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleInvite = (email: string) => {
    inviteManager(email);
    setShowInviteModal(false);
  };

  const handleEdit = (manager: any) => {
    setSelectedManager(manager);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updated: any) => {
    updateManager(updated.id, updated);
    setShowEditModal(false);
    setSelectedManager(null);
  };

  const handleActivate = (id: string) => {
    activateManager(id);
  };

  const handleDeactivate = (id: string) => {
    deactivateManager(id);
  };

  const handleResendInvite = (id: string) => {
    resendInvite(id);
    window.alert("Invitación reenviada (placeholder)");
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "¿Seguro que deseas eliminar este Jefe de Tráfico? Esta acción no se puede deshacer."
      )
    ) {
      deleteManager(id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#22142A] flex flex-col items-center pb-24 relative">
      {/* Header alineado a arte general */}
      <header className="w-full flex flex-col items-center justify-center pb-5 animate-fade-in">
        <div className="w-full max-w-3xl px-4">
          <h1
            className="text-2xl text-white font-bold mb-2 text-center"
            style={{
              letterSpacing: "-0.03em",
            }}
          >
            Gestión Jefes de Tráfico
          </h1>
          <p
            className="text-white/80 text-base md:text-lg text-center mb-1 font-normal"
            style={{
              fontFamily: "Helvetica",
              lineHeight: 1.35,
              margin: "0 auto",
              maxWidth: 540,
            }}
          >
            Administra, invita y monitoriza tu equipo de coordinadores Drove.
          </p>
          <br />
        </div>
      </header>

      <div className="grid grid-cols-5 gap-8 w-full">
        {/* Métricas integradas, coherentes con dashboard */}
        <section
          className="w-full col-span-full pb-5 lg:pb-0 lg:col-span-3 grid grid-cols-3 gap-5 justify-center max-w-3xl mb-1"
          style={{ minHeight: 58 }}
        >
          <div className="bg-white/10 rounded-2xl p-4 border border-white/15 shadow-md flex flex-col justify-center items-center min-w-0">
            <span
              className="text-2xl font-bold text-[#6EF7FF]"
              style={{ fontFamily: "Helvetica" }}
            >
              {metrics.total}
            </span>
            <span
              className="text-xs font-semibold text-[#6EF7FF] mt-0.5 tracking-wide"
              style={{ fontFamily: "Helvetica" }}
            >
              Total
            </span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/15 shadow-md flex flex-col justify-center items-center min-w-0">
            <span
              className="text-2xl font-bold text-[#6EF7FF]"
              style={{ fontFamily: "Helvetica" }}
            >
              {metrics.active}
            </span>
            <span
              className="text-xs font-semibold text-[#6EF7FF] mt-0.5 tracking-wide"
              style={{ fontFamily: "Helvetica" }}
            >
              Activos
            </span>
          </div>
          <div className="bg-white/10 rounded-2xl justify-center p-4 border border-white/15 shadow-md flex flex-col items-center min-w-0">
            <span
              className="text-2xl font-bold text-[#6EF7FF]"
              style={{ fontFamily: "Helvetica" }}
            >
              {metrics.invited}
            </span>
            <span
              className="text-xs font-semibold text-[#6EF7FF] mt-0.5 tracking-wide"
              style={{ fontFamily: "Helvetica" }}
            >
              Invitaciones
            </span>
          </div>
        </section>

        <section className="col-span-full lg:col-span-2">
          {/* Buscador sticky en mobile */}
          <div
            className="w-full flex justify-center z-30 sticky top-[94px] sm:top-[118px] mb-3"
            style={{ background: "transparent" }}
          >
            <TrafficManagersSearchBar
              value={search}
              onChange={setSearch}
              isMobile={isMobile}
            />
          </div>

          <div className="h-[1px] bg-white/20 my-6 w-full"></div>

          {/* Mobile: Botón acción principal sticky bottom, agregamos padding inferior para evitar FAB */}
          {isMobile && (
            <div className="flex justify-center items-center gap-3 w-full z-50">
              Agregar Nuevo Jefe de Tráfico
              <Button
                className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] p-3 text-base shadow-lg"
                onClick={() => setShowInviteModal(true)}
                style={{ fontFamily: "Helvetica", minWidth: 0 }}
              >
                <Plus className="" size={25} strokeWidth={"3px"} />
              </Button>
            </div>
          )}

          {/* Desktop: Botón normal en top */}
          {!isMobile && (
            <div className="w-full max-w-3xl flex justify-center items-center gap-2 pb-1 px-2 sm:px-6 animate-fade-in ">
              Agregar Nuevo Jefe de Tráfico
              <Button
                className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] p-3 text-base shadow-lg"
                onClick={() => setShowInviteModal(true)}
                style={{ fontFamily: "Helvetica", minWidth: 0 }}
              >
                <Plus className="" size={25} strokeWidth={"3px"} />
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Cards/tabla responsive */}
      <main
        className="w-full max-w-3xl md:mt-2 px-2 xs:px-1 sm:px-6 pt-1"
        style={{
          paddingTop: isMobile ? 12 : 0,
          paddingBottom: isMobile ? 52 : 32, // aumentamos margen inferior móvil
          overflow: "visible",
        }}
      >
        <TrafficManagerTable
          managers={filteredManagers}
          onEdit={handleEdit}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onResendInvite={handleResendInvite}
          onDelete={handleDelete}
        />
        {filteredManagers.length === 0 && (
          <div className="text-center py-10 text-white/70">
            No hay Jefes de Tráfico registrados aún.
          </div>
        )}
      </main>

      {/* Modales */}
      <InviteTrafficManagerModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={handleInvite}
      />
      <EditTrafficManagerModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setSelectedManager(null);
        }}
        manager={selectedManager}
        onSave={handleSaveEdit}
      />

      {/* Relleno en mobile para no tapar último card */}
      <div className={isMobile ? "h-40" : ""}></div>
    </div>
  );
};

export default JefesDeTrafico;