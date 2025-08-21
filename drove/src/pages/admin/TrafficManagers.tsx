
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InviteTrafficManagerModal from "./components/InviteTrafficManagerModal";
import EditTrafficManagerModal from "./components/EditTrafficManagerModal";
import TrafficManagerTable from "./components/TrafficManagerTable";
import { useTrafficManagerService } from "@/hooks/useTrafficManagerService";

const TrafficManagers = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any | null>(null);
  
  const {
    managers,
    inviteManager,
    updateManager,
    activateManager,
    deactivateManager,
    deleteManager,
    resendInvite,
  } = useTrafficManagerService();

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
    if (window.confirm("¿Seguro que deseas eliminar este Jefe de Tráfico? Esta acción no se puede deshacer.")) {
      deleteManager(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Helvetica Bold" }}>
          Gestión Jefes de Tráfico
        </h1>
        <p className="text-white/70">Crea, gestiona e invita nuevos Jefes para la gestión de traslados de tu empresa.</p>
      </div>

      <div className="flex justify-end items-center mt-10 mb-3">
        <Button
          variant="default"
          className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold px-6 py-3 text-base shadow-lg"
          onClick={() => setShowInviteModal(true)}
        >
          <Plus className="mr-2" size={20} /> Nuevo Jefe de Tráfico
        </Button>
      </div>

      <div className="bg-white/10 rounded-2xl p-3 md:p-6 w-full overflow-x-auto">
        <TrafficManagerTable
          managers={managers}
          onEdit={handleEdit}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onResendInvite={handleResendInvite}
          onDelete={handleDelete}
        />
        {managers.length === 0 && (
          <div className="text-center py-10 text-white/70">No hay Jefes de Tráfico registrados aún.</div>
        )}
      </div>

      <InviteTrafficManagerModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={handleInvite}
      />

      <EditTrafficManagerModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if(!open) setSelectedManager(null);
        }}
        manager={selectedManager}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default TrafficManagers;
