
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
import { Textarea } from '@/components/ui/textarea';
import { Shield, Eye, EyeOff, Lock, Users, Database, Activity, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import userService from '@/services/userService'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preferenceUser: any;
}

export const PrivacySettingsModal: React.FC<Props> = ({ isOpen, onClose, preferenceUser }) => {
  const [settings, setSettings] = useState({
    ...preferenceUser
  });

  const [dataRequest, setDataRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {

      const resultUpdated = await userService.updateUserPreference(settings);
      
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias de privacidad han sido actualizadas.",
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

  const handleDataRequest = async () => {
    if (!dataRequest.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, describe qué datos necesitas.",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de datos ha sido enviada. Recibirás una respuesta en 48 horas.",
      });
      
      setDataRequest('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al enviar la solicitud.",
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
            <Shield size={20} className="text-[#6EF7FF]" />
            Configuración de Privacidad
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Controla cómo se comparte y utiliza tu información personal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuración de Perfil */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Visibilidad del Perfil</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showOnlineStatus" className="text-white/80">Mostrar estado en línea</Label>
                <Switch
                  id="showOnlineStatus"
                  checked={settings.profile.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting('profile', 'showOnlineStatus', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowSearch" className="text-white/80">Permitir búsqueda por otros usuarios</Label>
                <Switch
                  id="allowSearch"
                  checked={settings.profile.allowSearch}
                  onCheckedChange={(checked) => updateSetting('profile', 'allowSearch', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showActivity" className="text-white/80">Mostrar actividad reciente</Label>
                <Switch
                  id="showActivity"
                  checked={settings.profile.showActivity}
                  onCheckedChange={(checked) => updateSetting('profile', 'showActivity', checked)}
                />
              </div>
            </div>
          </div>

          {/* Configuración de Datos */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Uso de Datos</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="shareAnalytics" className="text-white/80">Compartir datos analíticos</Label>
                <Switch
                  id="shareAnalytics"
                  checked={settings?.data?.shareAnalytics}
                  onCheckedChange={(checked) => updateSetting('data', 'shareAnalytics', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowCookies" className="text-white/80">Permitir cookies no esenciales</Label>
                <Switch
                  id="allowCookies"
                  checked={settings?.data?.allowCookies}
                  onCheckedChange={(checked) => updateSetting('data', 'allowCookies', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dataRetention" className="text-white/80">Retención extendida de datos</Label>
                <Switch
                  id="dataRetention"
                  checked={settings?.data?.dataRetention}
                  onCheckedChange={(checked) => updateSetting('data', 'dataRetention', checked)}
                />
              </div>
            </div>
          </div>

          {/* Configuración de Seguridad */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Seguridad</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth" className="text-white/80">Autenticación de dos factores</Label>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="loginAlerts" className="text-white/80">Alertas de inicio de sesión</Label>
                <Switch
                  id="loginAlerts"
                  checked={settings.security.loginAlerts}
                  onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sessionTimeout" className="text-white/80">Cierre automático de sesión</Label>
                <Switch
                  id="sessionTimeout"
                  checked={settings.security.sessionTimeout}
                  onCheckedChange={(checked) => updateSetting('security', 'sessionTimeout', checked)}
                />
              </div>
            </div>
          </div>

          {/* Solicitud de Datos */}
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#6EF7FF]" />
              <h3 className="font-bold text-white">Solicitar Mis Datos</h3>
            </div>
            <p className="text-white/70 text-sm mb-3">
              Solicita una copia de todos los datos que tenemos sobre ti.
            </p>
            <div className="space-y-3">
              <Textarea
                placeholder="Describe qué datos específicos necesitas (opcional)..."
                value={dataRequest}
                onChange={(e) => setDataRequest(e.target.value)}
                className="bg-white/5 border-white/20 text-white rounded-2xl"
                rows={3}
              />
              <Button
                onClick={handleDataRequest}
                disabled={loading}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 rounded-2xl"
              >
                {loading ? 'Enviando...' : 'Solicitar Datos'}
              </Button>
            </div>
          </div>

          {/* Zona de Peligro */}
          <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-4">
            <button
              onClick={() => setShowDangerZone(!showDangerZone)}
              className="flex items-center gap-2 text-red-300 hover:text-red-200 transition-colors"
            >
              <AlertTriangle size={18} />
              <span className="font-medium">Zona de Peligro</span>
              {showDangerZone ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            
            {showDangerZone && (
              <div className="mt-4 space-y-3">
                <p className="text-red-300 text-sm">
                  Estas acciones son permanentes e irreversibles.
                </p>
                <Button
                  variant="destructive"
                  className="w-full rounded-2xl"
                  onClick={() => toast({
                    title: "Función no disponible",
                    description: "Esta función estará disponible próximamente.",
                  })}
                >
                  Eliminar Cuenta Permanentemente
                </Button>
              </div>
            )}
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
