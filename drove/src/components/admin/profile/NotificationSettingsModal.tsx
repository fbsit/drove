
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, Monitor, Users, Car, TrendingUp, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import userService from '@/services/userService'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preferenceUser: any
}

export const NotificationSettingsModal: React.FC<Props> = ({ isOpen, onClose, preferenceUser }) => {
  const safeDefaults = {
    email: { newTransfers: false, droverUpdates: false, paymentAlerts: false, systemUpdates: true, weeklyReports: false },
    push: { urgentAlerts: true, newRegistrations: false, completedTransfers: false, lowBalance: false },
    dashboard: { realTimeUpdates: true, soundEffects: false, popupNotifications: true },
  } as any;
  const [settings, setSettings] = useState<any>({ ...(safeDefaults), ...(preferenceUser || {}) });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      
      const resultUpdated = await userService.updateUserPreference(settings);
      
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias de notificaciones han sido actualizadas.",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al guardar la configuración. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof typeof settings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#22142A] text-white border-white/20 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell size={20} className="text-[#6EF7FF]" />
            Configuración de Notificaciones
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Personaliza cómo y cuándo quieres recibir notificaciones del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notificaciones por Email */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Notificaciones por Email</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="newTransfers" className="text-white/80">Nuevos traslados</Label>
                <Switch
                  id="newTransfers"
                  checked={!!settings?.email?.newTransfers}
                  onCheckedChange={(checked) => updateSetting('email', 'newTransfers', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="droverUpdates" className="text-white/80">Actualizaciones de drovers</Label>
                <Switch
                  id="droverUpdates"
                  checked={!!settings?.email?.droverUpdates}
                  onCheckedChange={(checked) => updateSetting('email', 'droverUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="paymentAlerts" className="text-white/80">Alertas de pagos</Label>
                <Switch
                  id="paymentAlerts"
                  checked={!!settings?.email?.paymentAlerts}
                  onCheckedChange={(checked) => updateSetting('email', 'paymentAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="systemUpdates" className="text-white/80">Actualizaciones del sistema</Label>
                <Switch
                  id="systemUpdates"
                  checked={!!settings?.email?.systemUpdates}
                  onCheckedChange={(checked) => updateSetting('email', 'systemUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weeklyReports" className="text-white/80">Reportes semanales</Label>
                <Switch
                  id="weeklyReports"
                  checked={!!settings?.email?.weeklyReports}
                  onCheckedChange={(checked) => updateSetting('email', 'weeklyReports', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notificaciones Push */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Notificaciones Push</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="urgentAlerts" className="text-white/80">Alertas urgentes</Label>
                <Switch
                  id="urgentAlerts"
                  checked={!!settings?.push?.urgentAlerts}
                  onCheckedChange={(checked) => updateSetting('push', 'urgentAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newRegistrations" className="text-white/80">Nuevos registros</Label>
                <Switch
                  id="newRegistrations"
                  checked={!!settings?.push?.newRegistrations}
                  onCheckedChange={(checked) => updateSetting('push', 'newRegistrations', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="completedTransfers" className="text-white/80">Traslados completados</Label>
                <Switch
                  id="completedTransfers"
                  checked={!!settings?.push?.completedTransfers}
                  onCheckedChange={(checked) => updateSetting('push', 'completedTransfers', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lowBalance" className="text-white/80">Saldo bajo</Label>
                <Switch
                  id="lowBalance"
                  checked={!!settings?.push?.lowBalance}
                  onCheckedChange={(checked) => updateSetting('push', 'lowBalance', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notificaciones del Dashboard */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Dashboard</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="realTimeUpdates" className="text-white/80">Actualizaciones en tiempo real</Label>
                <Switch
                  id="realTimeUpdates"
                  checked={!!settings?.dashboard?.realTimeUpdates}
                  onCheckedChange={(checked) => updateSetting('dashboard', 'realTimeUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="soundEffects" className="text-white/80">Efectos de sonido</Label>
                <Switch
                  id="soundEffects"
                  checked={!!settings?.dashboard?.soundEffects}
                  onCheckedChange={(checked) => updateSetting('dashboard', 'soundEffects', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="popupNotifications" className="text-white/80">Notificaciones popup</Label>
                <Switch
                  id="popupNotifications"
                  checked={!!settings?.dashboard?.popupNotifications}
                  onCheckedChange={(checked) => updateSetting('dashboard', 'popupNotifications', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
