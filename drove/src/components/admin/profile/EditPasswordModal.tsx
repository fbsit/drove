
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AuthService from '@/services/authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EditPasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  // Validaciones de contraseña
  const passwordValidations = {
    length: formData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
    match: formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '',
  };

  const isFormValid = Object.values(passwordValidations).every(Boolean) && formData.currentPassword !== '';

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      
      const resultChangePassword = await AuthService.changePassword(formData.currentPassword,formData.newPassword, formData.confirmPassword);
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });
      
      handleClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar la contraseña. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#22142A] text-white border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={20} className="text-[#6EF7FF]" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Por seguridad, introduce tu contraseña actual y define una nueva.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contraseña actual */}
          <div>
            <Label htmlFor="currentPassword" className="text-white/80">Contraseña actual</Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Tu contraseña actual"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="bg-white/5 border-white/20 text-white rounded-2xl pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <Label htmlFor="newPassword" className="text-white/80">Nueva contraseña</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Tu nueva contraseña"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="bg-white/5 border-white/20 text-white rounded-2xl pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <Label htmlFor="confirmPassword" className="text-white/80">Confirmar nueva contraseña</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-white/5 border-white/20 text-white rounded-2xl pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Validaciones */}
          {formData.newPassword && (
            <div className="bg-white/5 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Shield size={14} />
                Requisitos de seguridad:
              </div>
              <div className="space-y-1 text-sm">
                <div className={`flex items-center gap-2 ${passwordValidations.length ? 'text-green-400' : 'text-white/60'}`}>
                  <CheckCircle size={12} className={passwordValidations.length ? 'text-green-400' : 'text-white/30'} />
                  Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-2 ${passwordValidations.uppercase ? 'text-green-400' : 'text-white/60'}`}>
                  <CheckCircle size={12} className={passwordValidations.uppercase ? 'text-green-400' : 'text-white/30'} />
                  Al menos una mayúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidations.lowercase ? 'text-green-400' : 'text-white/60'}`}>
                  <CheckCircle size={12} className={passwordValidations.lowercase ? 'text-green-400' : 'text-white/30'} />
                  Al menos una minúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidations.number ? 'text-green-400' : 'text-white/60'}`}>
                  <CheckCircle size={12} className={passwordValidations.number ? 'text-green-400' : 'text-white/30'} />
                  Al menos un número
                </div>
                <div className={`flex items-center gap-2 ${passwordValidations.match ? 'text-green-400' : 'text-white/60'}`}>
                  <CheckCircle size={12} className={passwordValidations.match ? 'text-green-400' : 'text-white/30'} />
                  Las contraseñas coinciden
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
