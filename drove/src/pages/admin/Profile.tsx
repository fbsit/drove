import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, Phone, MapPin, Edit, Calendar, Shield, 
  Settings, Key, Bell, Camera, CheckCircle, Clock,
  Users, Car, TrendingUp, BarChart3, Save, X
} from 'lucide-react';
import { EditEmailModal } from '@/components/admin/profile/EditEmailModal';
import { EditPasswordModal } from '@/components/admin/profile/EditPasswordModal';
import { NotificationSettingsModal } from '@/components/admin/profile/NotificationSettingsModal';
import { PrivacySettingsModal } from '@/components/admin/profile/PrivacySettingsModal';
import authService from "@/services/authService";  


const emptyAdmin = {
  avatar: "",
  fullName: "",
  role: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  created_at: "",
};

const AdminProfile = () => {

  const [adminData, setAdminData] = useState(emptyAdmin);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [formData, setFormData] = useState<any>(emptyAdmin);

   useEffect(() => {
    const fetchAdmin = async () => {
      try {
        // getCurrentUser devuelve directamente el usuario; pero contemplamos { user } para compatibilidad
        const resp: any = await authService.getCurrentUser();
        const user = resp?.user ?? resp;
        if (!user) {
          setAdminData(emptyAdmin);
          setFormData(emptyAdmin);
          return;
        }

        const mapped = {
          avatar: (user as any)?.avatar ?? (user as any)?.selfie ?? "",
          fullName: (user as any)?.full_name ?? (user as any)?.fullName ?? (user as any)?.contactInfo?.fullName ?? "",
          role: (user as any)?.role ?? 'Administrador',
          email: (user as any)?.email ?? (user as any)?.contactInfo?.email ?? "",
          phone: (user as any)?.phone ?? (user as any)?.contactInfo?.phone ?? (user as any)?.contactInfo?.phones?.[0] ?? "",
          address: (user as any)?.address ?? (user as any)?.contactInfo?.address ?? "",
          city: (user as any)?.city ?? (user as any)?.contactInfo?.city ?? "",
          created_at: (user as any)?.created_at ?? (user as any)?.createdAt ?? "",
        };

        setAdminData(mapped);
        setFormData(mapped);
      } catch (err) {
        console.error("Error obteniendo usuario:", err);
      }
    };

    fetchAdmin();
  }, []);

  // Estadísticas del admin
  const adminStats = {
    totalUsers: 1247,
    activeDrivers: 89,
    pendingApprovals: 12,
    monthlyRevenue: "€45,280"
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Perfil actualizado:", formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  
  console.log("isEditing", isEditing);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con foto de perfil */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#6EF7FF] to-[#32dfff] p-1">
                  <div className="w-full h-full rounded-full bg-[#22142A] flex items-center justify-center overflow-hidden">
                    <img 
                      src={adminData.avatar} 
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-[#6EF7FF] hover:bg-[#32dfff] rounded-full p-2 transition-colors">
                  <Camera size={16} className="text-[#22142A]" />
                </button>
              </div>

              {/* Información básica */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {adminData.fullName || 'Administrador'}
                </h1>
                <p className="text-[#6EF7FF] text-lg mb-2">{adminData.role}</p>
                <p className="text-white/70 mb-4">{adminData.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <CheckCircle size={14} />
                    Verificado
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Clock size={14} />
                    Último acceso: Hoy 14:30
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
                    >
                      <X className="mr-2" size={18} />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
                    >
                      <Save className="mr-2" size={18} />
                      Guardar
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
                  >
                    <Edit className="mr-2" size={18} />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - ARREGLADO EL CONTRASTE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/30 to-blue-600/10 border-blue-400/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
                <Users size={24} className="text-blue-600" />
              </div>
              <h3 className="text-black font-bold text-sm mb-1">Usuarios Totales</h3>
              <p className="text-2xl font-bold text-black">{adminStats.totalUsers.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/30 to-green-600/10 border-green-400/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
                <Car size={24} className="text-green-600" />
              </div>
              <h3 className="text-black font-bold text-sm mb-1">Drovers Activos</h3>
              <p className="text-2xl font-bold text-black">{adminStats.activeDrivers}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border-yellow-400/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <h3 className="text-black font-bold text-sm mb-1">Pendientes</h3>
              <p className="text-2xl font-bold text-black">{adminStats.pendingApprovals}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/30 to-purple-600/10 border-purple-400/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <h3 className="text-black font-bold text-sm mb-1">Ingresos Mes</h3>
              <p className="text-2xl font-bold text-black">{adminStats.monthlyRevenue}</p>
            </CardContent>
          </Card>
        </div>

        {/* Información personal y configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información personal */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User size={20} />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-white/80">Nombre Completo</Label>
                {isEditing ? (
                  <Input 
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="bg-white/5 border-white/20 text-white mt-1 rounded-2xl"
                  />
                ) : (
                  <div className="mt-1 p-3 bg-white/5 rounded-2xl">
                    <p className="text-white">{formData.fullName || '—'}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="mt-1 p-3 bg-white/5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#6EF7FF]" />
                      <p className="text-white">{formData.email || '—'}</p>
                    </div>
                    {!isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowEmailModal(true)}
                        className="text-[#6EF7FF] hover:bg-[#6EF7FF]/10 p-1 h-auto"
                      >
                        <Edit size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-white/80">Teléfono</Label>
                {isEditing ? (
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-white/5 border-white/20 text-white mt-1 rounded-2xl"
                  />
                ) : (
                  <div className="mt-1 p-3 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-[#6EF7FF]" />
                      <p className="text-white">{formData.phone || '—'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-white/80">Dirección</Label>
                {isEditing ? (
                  <Input 
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-white/5 border-white/20 text-white mt-1 rounded-2xl"
                  />
                ) : (
                  <div className="mt-1 p-3 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#6EF7FF]" />
                      <p className="text-white">{formData.address || '—'}{formData.city ? `, ${formData.city}` : ''}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="createdAt" className="text-white/80">Administrador desde</Label>
                <div className="mt-1 p-3 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#6EF7FF]" />
                    <p className="text-white">{adminData.created_at ? new Date(adminData.created_at).toLocaleDateString('es-ES') : '—'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración y seguridad - ACTUALIZADO */}
          <div className="space-y-6">
            {/* Configuración de cuenta */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings size={20} />
                  Configuración de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 rounded-2xl"
                >
                  <Key className="mr-2" size={16} />
                  Cambiar Contraseña
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowNotificationModal(true)}
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 rounded-2xl"
                >
                  <Bell className="mr-2" size={16} />
                  Configurar Notificaciones
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => setShowPrivacyModal(true)}
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 rounded-2xl"
                >
                  <Shield className="mr-2" size={16} />
                  Configuración de Privacidad
                </Button>
              </CardContent>
            </Card>

            {/* Accesos rápidos */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 size={20} />
                  Accesos Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
                >
                  <Users className="mr-2" size={16} />
                  Gestionar Usuarios
                </Button>
                
                <Button 
                  className="w-full justify-start bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
                >
                  <Car className="mr-2" size={16} />
                  Ver Drovers
                </Button>

                <Button 
                  className="w-full justify-start bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-2xl"
                >
                  <TrendingUp className="mr-2" size={16} />
                  Reportes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modales - ACTUALIZADOS */}
      <EditEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={adminData.email}
      />

      <EditPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <NotificationSettingsModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      <PrivacySettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};

export default AdminProfile;
