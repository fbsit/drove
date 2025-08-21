
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => void;
}

const InviteTrafficManagerModal: React.FC<Props> = ({ open, onOpenChange, onInvite }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        onOpenChange(false);
      }, 1300);
    }, 900);
    // Aquí se llamaría: onInvite(email)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#22142A] text-white rounded-2xl max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Invitar Jefe de Tráfico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-white block mb-2" htmlFor="tmgr-email">
              Email del Jefe de Tráfico
            </label>
            <Input
              id="tmgr-email"
              type="email"
              autoFocus
              placeholder="ejemplo@empresa.es"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="rounded-2xl bg-white/10 border-white/10 text-white placeholder-white/40"
              disabled={loading || success}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="rounded-2xl bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold"
              disabled={loading || !email}
            >
              <Mail className="mr-2" size={16} /> {loading ? "Enviando..." : (success ? "Invitación enviada" : "Invitar")}
              {success && <Check className="ml-2" size={16} />}
            </Button>
          </DialogFooter>
        </form>
        {/* Placeholder / TODO: integrar con backend de invitación */}
      </DialogContent>
    </Dialog>
  );
};

export default InviteTrafficManagerModal;
