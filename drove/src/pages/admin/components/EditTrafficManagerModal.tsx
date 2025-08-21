
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: {
    id: string;
    name: string;
    email: string;
    active: boolean;
    invited: boolean;
  } | null;
  onSave: (manager: { id: string; name: string; email: string; active: boolean; invited: boolean }) => void;
}

/**
 * Modal de edición de Jefe de Tráfico
 * Los cambios no se almacenan en backend (solo mock)
 */
const EditTrafficManagerModal: React.FC<Props> = ({ open, onOpenChange, manager, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (manager) {
      setName(manager.name || "");
      setEmail(manager.email || "");
      setActive(manager.active);
    }
  }, [manager]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager) return;
    onSave({
      id: manager.id,
      name,
      email,
      active,
      invited: manager.invited,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#22142A] text-white rounded-2xl max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Editar Jefe de Tráfico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="edit-name" className="mb-2 block">Nombre</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-2xl bg-white/10 border-white/10 text-white placeholder-white/40"
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="edit-email" className="mb-2 block">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-2xl bg-white/10 border-white/10 text-white placeholder-white/40"
              required
              disabled
            />
          </div>
          <div className="mb-4 flex items-center space-x-3">
            <Label className="">Estado:</Label>
            <Button
              type="button"
              variant={active ? "default" : "outline"}
              className={`rounded-2xl ${active ? 'bg-green-500 text-white' : 'bg-transparent text-white border-white/30'}`}
              onClick={() => setActive(true)}
            >
              <Check className="mr-2" size={16} /> Activo
            </Button>
            <Button
              type="button"
              variant={!active ? "default" : "outline"}
              className={`rounded-2xl ${!active ? 'bg-gray-500 text-white' : 'bg-transparent text-white border-white/30'}`}
              onClick={() => setActive(false)}
            >
              <X className="mr-2" size={16} /> Inactivo
            </Button>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTrafficManagerModal;
