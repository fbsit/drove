// pages/ClientProfile.tsx
// Perfil detallado del cliente con datos reales y KPIs.
// ------------------------------------------------------
// – UserService.getUserProfile()            → datos personales
// – TransferService.getTravelsByClient(id)  → estadísticas de traslados

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Calendar,
  Shield,
  Key,
  Bell,
  Camera,
  CheckCircle,
  Clock,
  Car,
  CreditCard,
  FileText,
  BarChart3,
  Save,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { EditEmailModal } from "@/components/admin/profile/EditEmailModal";
import { EditPasswordModal } from "@/components/admin/profile/EditPasswordModal";
import { NotificationSettingsModal } from "@/components/admin/profile/NotificationSettingsModal";
import { PrivacySettingsModal } from "@/components/admin/profile/PrivacySettingsModal";

import UserService from "@/services/userService";
import TransferService from "@/services/transferService";
import { useAuth } from "@/contexts/AuthContext";

/* -------------------------------------------------- */
/* Tipos                                              */
/* -------------------------------------------------- */
interface ClientStats {
  totalTransfers: number;
  completedTransfers: number;
  pendingTransfers: number;
  monthlySpending: number;
}

interface ClientProfileData {
  id?: string;
  avatar_url?: string;
  full_name?: string;
  fullName?: string; // fallback
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  company_name?: string;
  created_at?: string;
}

/* -------------------------------------------------- */
/* Componente principal                               */
/* -------------------------------------------------- */
const ClientProfile: React.FC = () => {
  const { user } = useAuth();
  const clientId = user?.id;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  /* modales */
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [preferenceUser, setPreferenceUser] = useState(null);
  /* datos */
  const [clientData, setClientData] = useState<ClientProfileData>();
  const [formData, setFormData] = useState<ClientProfileData>();
  const [stats, setStats] = useState<ClientStats>({
    totalTransfers: 0,
    completedTransfers: 0,
    pendingTransfers: 0,
    monthlySpending: 0,
  });

  useEffect(() => {
    handleGetPreferenceUser()
  },[])

  const handleGetPreferenceUser = async () => { 
    const resultPreference = await UserService.getPreferences();
    setPreferenceUser(resultPreference);
    console.log("resultPreference", resultPreference);
  }

  /* ------------------ helpers ------------------ */
  const mapProfile = useCallback((data: any): ClientProfileData => ({
    ...data,
    full_name: data.full_name ?? data.fullName,
  }), []);

  /* ------------------ fetch perfil + stats ------------------ */
  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      try {
        setLoading(true);

        // Perfil
        const profileRaw = await UserService.getUserProfile();
        const profile = mapProfile(profileRaw);
        setClientData(profile);
        setFormData(profile);

        // Traslados para KPIs
        const travels = await TransferService.getTravelsByClient(clientId);
        const total = travels.length;
        const completed = travels.filter((t: any) => t.status === "DELIVERED").length;
        const pending = total - completed;

        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const monthlySpent = travels
          .filter((t: any) => {
            const d = new Date(t.createdAt ?? t.created_at);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((sum: number, t: any) => sum + (+(t.totalPrice ?? 0)), 0);

        setStats({
          totalTransfers: total,
          completedTransfers: completed,
          pendingTransfers: pending,
          monthlySpending: monthlySpent,
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error al cargar",
          description: "No se pudo cargar tu perfil.",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId, mapProfile]);

  /* ------------------ handlers ------------------ */
  const handleInputChange = (path: string, value: any) =>
    setFormData((prev) => {
      const draft: any = structuredClone(prev ?? {});

      const keys = path.split('.');
      let ref = draft;

      keys.forEach((k, i) => {
        if (i === keys.length - 1) {
          ref[k] = value;                   // último nivel → asigno valor completo
        } else {
          ref[k] ??= {};                    // crea objeto intermedio si no existe
          ref = ref[k];
        }
      });

      return draft;
    });

  const handleSave = async () => {
    console.log("form", formData);
    if (!formData) return;
    try {
      const newPayload = {
        contactInfo: {
          ...user.contactInfo,
          fullName: formData?.contactInfo?.fullName || '',
          phone: formData?.contactInfo?.phone || formData?.contactInfo?.phones[0] || '',
          address: formData?.contactInfo?.address,
          documentId: formData?.contactInfo?.identificationNumber || '',
          documentType: formData?.contactInfo?.documentType || 'RUN',
          profileComplete: formData?.contactInfo?.profileComplete || true
        }
      };
      console.log("new", newPayload)
      await UserService.updateUserProfile(user.id, newPayload);
      setClientData(formData);
      setIsEditing(false);
      toast({ title: "Perfil actualizado" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil.",
      });
    }
  };

  const handleCancel = () => {
    setFormData(clientData);
    setIsEditing(false);
  };

  /* ------------------ loading ------------------ */
  if (loading || !clientData || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#22142A]">
        <Clock className="w-8 h-8 animate-spin text-[#6EF7FF]" />
      </div>
    );
  }

  /* ------------------ render ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-3 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ProfileHeader
          avatar={clientData.selfie}
          fullName={clientData.contactInfo.fullName || clientData.fullName || ""}
          role={clientData.role || "Cliente"}
          email={clientData.email || ""}
          company={clientData.company_name || ""}
        />

        {/* KPIs */}
        <ClientKPIs stats={stats} />

        {/* Información personal + ajustes */}
        <InfoAndSettings
          isEditing={isEditing}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          handleCancel={handleCancel}
          openEmailModal={() => setShowEmailModal(true)}
          openPasswordModal={() => setShowPasswordModal(true)}
          openNotifModal={() => setShowNotificationModal(true)}
          openPrivacyModal={() => setShowPrivacyModal(true)}
          setIsEditing={setIsEditing}
          createdAt={clientData.created_at || new Date().toISOString()}
        />
      </div>

      {/* Modales */}
      <EditEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={clientData.email || ""}
      />
      <EditPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <NotificationSettingsModal
        preferenceUser={preferenceUser}
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
      <PrivacySettingsModal
        preferenceUser={preferenceUser}
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};

/* -------------------------------------------------- */
/* Sub‑componentes                                    */
/* -------------------------------------------------- */
const ProfileHeader: React.FC<{
  avatar?: string;
  fullName: string;
  role: string;
  email: string;
  company: string;
}> = ({ avatar, fullName, role, email, company }) => (
  <div className="mb-6">
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="relative">
          <img
            src={avatar || "/avatar.png"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#6EF7FF]"
          />
          <button className="absolute bottom-0 right-0 bg-[#6EF7FF] rounded-full p-1">
            <Camera size={12} className="text-[#22142A]" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-white">{fullName}</h1>
          <p className="text-[#6EF7FF]">{role}</p>
          <p className="text-white/70">{email}</p>
          {company && <p className="text-white/60 text-sm">{company}</p>}
        </div>
      </div>
    </div>
  </div>
);

/* KPI cards */
const ClientKPIs: React.FC<{ stats: ClientStats }> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <KpiCard title="Total Traslados" value={stats.totalTransfers} icon={Car} color="blue" />
    <KpiCard title="Completados" value={stats.completedTransfers} icon={CheckCircle} color="green" />
    <KpiCard title="Pendientes" value={stats.pendingTransfers} icon={Clock} color="yellow" />
    <KpiCard title="Gasto Mensual (€)" value={stats.monthlySpending.toLocaleString()} icon={CreditCard} color="purple" />
  </div>
);

const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
  blue: { bg: "bg-blue-500/30", border: "border-blue-400/40", icon: "text-blue-600" },
  green: { bg: "bg-green-500/30", border: "border-green-400/40", icon: "text-green-600" },
  yellow: { bg: "bg-yellow-500/30", border: "border-yellow-400/40", icon: "text-yellow-600" },
  purple: { bg: "bg-purple-500/30", border: "border-purple-400/40", icon: "text-purple-600" },
};

const KpiCard: React.FC<{
  title: string;
  value: number | string;
  icon: typeof CheckCircle;
  color: keyof typeof colorClasses;
}> = ({ title, value, icon: Icon, color }) => {
  const cls = colorClasses[color];
  return (
    <Card className={`${cls.bg} ${cls.border} backdrop-blur-sm`}>
      <CardContent className="p-3 text-center">
        <div className="bg-white/90 p-2 rounded-xl w-fit mx-auto mb-2">
          <Icon size={18} className={cls.icon} />
        </div>
        <h3 className="text-black text-xs font-bold">{title}</h3>
        <p className="text-xl font-bold text-black">{value}</p>
      </CardContent>
    </Card>
  );
};

/* Información + ajustes */
const InfoAndSettings: React.FC<any> = ({
  isEditing,
  formData,
  handleInputChange,
  handleSave,
  handleCancel,
  openEmailModal,
  openPasswordModal,
  openNotifModal,
  openPrivacyModal,
  setIsEditing,
  createdAt,
}) => (
  <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
    {/* Información personal */}
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <User size={16} /> Información Personal
          </CardTitle>
          {isEditing ? (
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X size={12} className="mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save size={12} className="mr-1" /> Guardar
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit size={12} className="mr-1" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>
      {console.log(formData)}

      <CardContent className="space-y-3 pt-0">
        {/* Nombre */}
        <Field
          label="Nombre Completo"
          value={formData.contactInfo?.fullName ?? ''}
          isEditing={isEditing}
          onChange={(v) => handleInputChange('contactInfo.fullName', v)}
        />

        {/* Email */}
        <Field
          label="Email"
          value={formData.email || ""}
          suffix={!isEditing && (
            <Button variant="ghost" size="iconSm" onClick={openEmailModal}>
              <Edit size={12} />
            </Button>
          )}
          readOnly
        />

        {/* Teléfono */}
        <Field
          label="Teléfono"
          value={(formData?.contactInfo?.phone || formData?.contactInfo?.phones?.[0]) ?? ''}
          isEditing={isEditing}
          onChange={(v: string) => handleInputChange("phone", v)}
        />

        {/* Dirección */}
        <Field
          label="Dirección"
          value={`${formData.contactInfo.address ?? ""}`}
          isEditing={isEditing}
          onChange={(v: string) => handleInputChange("address", v)}
        />

        {/* Cliente desde */}
        <Field
          label="Cliente desde"
          value={new Date(createdAt).toLocaleDateString("es-ES")}
          readOnly
        />
      </CardContent>
    </Card>

    {/* Configuración + accesos rápidos */}
    <div className="space-y-4">
      {/* Ajustes */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Key size={16} /> Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <Button variant="outline" className="w-full justify-start" onClick={openPasswordModal}>
            <Key size={12} className="mr-2" /> Cambiar contraseña
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={openNotifModal}>
            <Bell size={12} className="mr-2" /> Notificaciones
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={openPrivacyModal}>
            <Shield size={12} className="mr-2" /> Privacidad
          </Button>
        </CardContent>
      </Card>

      {/* Accesos rápidos */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 size={16} /> Accesos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <LinkButton to="/solicitar-traslado" icon={Car}>
            Solicitar traslado
          </LinkButton>
          <LinkButton to="/cliente/traslados" icon={FileText}>
            Mis traslados
          </LinkButton>
          <LinkButton to="/cliente/dashboard" icon={BarChart3}>
            Dashboard
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* Campo de formulario / display */
const Field: React.FC<{
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  suffix?: React.ReactNode;
}> = ({ label, value, isEditing, onChange, readOnly, suffix }) => (
  <div>
    <Label className="text-white/80 text-sm">{label}</Label>
    {isEditing ? (
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 bg-white/5 border-white/20 text-white rounded-2xl h-9"
      />
    ) : (
      <div className="mt-1 bg-white/5 rounded-2xl p-2 flex items-center justify-between">
        <span className="text-white/90">{value}</span>
        {suffix}
      </div>
    )}
  </div>
);

/* Botón tipo enlace */
const LinkButton: React.FC<{ to: string; icon: any; children: React.ReactNode }> = ({
  to,
  icon: Icon,
  children,
}) => (
  <Button
    asChild
    className="w-full justify-start bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A] font-bold rounded-xl"
  >
    <Link to={to}>
      <Icon size={12} className="mr-2" /> {children}
    </Link>
  </Button>
);

export default ClientProfile;
