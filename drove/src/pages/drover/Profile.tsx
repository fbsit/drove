
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import UserService from '@/services/userService';
import DroverService from '@/services/droverService';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, Calendar, Shield, Award, Clock3, TrendingUp, Activity, Euro, Star } from 'lucide-react';

const DroverProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    address: user?.address || ''
  });

  const [stats, setStats] = useState<any>({ totalEarnings: 0, monthlyAvg: 0, rating: 0, completed: 0, avgTimePerTrip: 'N/A', medals: 0 });

  React.useEffect(() => {
    const load = async () => {
      try {
        const profile = await UserService.getUserProfile();
        const p: any = profile?.user || profile || {};
        const nextForm = {
          full_name: p.full_name || p.fullName || (user as any)?.full_name || (user as any)?.fullName || (user as any)?.contactInfo?.fullName || '',
          email: p.email || (user as any)?.email || '',
          phone: p.phone || p?.contactInfo?.phone || (user as any)?.phone || (user as any)?.contactInfo?.phone || '',
          city: p.city || p?.contactInfo?.city || (user as any)?.city || (user as any)?.contactInfo?.city || '',
          address: p.address || p?.contactInfo?.address || (user as any)?.address || (user as any)?.contactInfo?.address || ''
        };
        setFormData(nextForm);
        const dash = await (DroverService as any).getDroverDashboard?.() || await (DroverService as any).getDroverStats?.();
        const s: any = dash?.stats || dash?.metrics || dash || {};
        setStats({
          totalEarnings: s.totalEarnings ?? 0,
          monthlyAvg: s.avgPerTrip ?? s.monthlyAvg ?? 0,
          rating: s.rating ?? 0,
          completed: s.completedTransfers ?? s.completed ?? 0,
          avgTimePerTrip: s.avgTimePerTrip ?? s.avgDuration ?? 'N/A',
          medals: s.medals ?? 0,
        });
      } catch (e) { console.error('[DROVER_PROFILE] fetch error', e); }
    };
    load();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('[DROVER_PROFILE] 🔄 Actualizando perfil:', formData);
      
      const updatedUser = await UserService.updateProfile(formData);
      updateUser(updatedUser);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente."
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('[DROVER_PROFILE] ❌ Error al actualizar perfil:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22142A] via-[#2A1B3D] to-[#22142A] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header card con datos principales */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#6EF7FF]/20 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.full_name?.[0] || 'D'}
                </div>
                <div>
                  <div className="text-white text-2xl font-bold">{user?.full_name || 'Drover'}</div>
                  <div className="text-[#6EF7FF] text-sm">DROVER • Aprobado</div>
                  <div className="text-white/70 text-sm flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Mail size={14}/> {user?.email}</span>
                    <span className="flex items-center gap-1"><Phone size={14}/> {user?.phone || '—'}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Nivel</div>
                <div className="text-white text-center bg-white/10 px-3 py-1 rounded-xl">3</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas separadas en cards con iconos/colores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border-emerald-400/40 border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3"><Euro size={24} className="text-emerald-600" /></div>
              <div className="text-black font-bold text-sm mb-1">Ganancias totales</div>
              <div className="text-2xl font-bold text-black">€{Number(stats.totalEarnings||0).toLocaleString()}</div>
              <div className="text-black/70 text-xs mt-1">desde alta</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/30 to-blue-600/10 border-blue-400/40 border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3"><TrendingUp size={24} className="text-blue-600" /></div>
              <div className="text-black font-bold text-sm mb-1">Promedio mensual</div>
              <div className="text-2xl font-bold text-black">€{Number(stats.monthlyAvg||0).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
              <div className="text-black/70 text-xs mt-1">promedio</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border-yellow-400/40 border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3"><Star size={24} className="text-yellow-600" /></div>
              <div className="text-black font-bold text-sm mb-1">Calificación</div>
              <div className="text-2xl font-bold text-black">{Number(stats.rating||0).toFixed(1)}</div>
              <div className="text-black/70 text-xs mt-1">de 5 estrellas</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/30 to-purple-600/10 border-purple-400/40 border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3"><Activity size={24} className="text-purple-600" /></div>
              <div className="text-black font-bold text-sm mb-1">Traslados</div>
              <div className="text-2xl font-bold text-black">{Number(stats.completed||0)}</div>
              <div className="text-black/70 text-xs mt-1">completados</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-sky-500/30 to-sky-600/10 border-sky-400/40 border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3"><Clock3 size={24} className="text-sky-600" /></div>
              <div className="text-black font-bold text-sm mb-1">Tiempo promedio</div>
              <div className="text-2xl font-bold text-black">{String(stats.avgTimePerTrip||'N/A')}</div>
              <div className="text-black/70 text-xs mt-1">por traslado</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/30 to-orange-600/10 border-orange-400/40 border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="bg-white/90 p-3 rounded-2xl w-fit mx-auto mb-3"><Award size={24} className="text-orange-600" /></div>
              <div className="text-black font-bold text-sm mb-1">Medallas</div>
              <div className="text-2xl font-bold text-black">{Number(stats.medals||0)}</div>
              <div className="text-black/70 text-xs mt-1">logros</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información personal */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isLoading}
                  className="bg-[#6EF7FF] hover:bg-[#5FE4ED] text-[#22142A]"
                >
                  {isEditing ? 'Guardar' : 'Editar'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Nombre completo</Label>
                    <Input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Teléfono</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Ciudad</Label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white/80">Dirección</Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Estado de cuenta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Estado:</span>
                    <span className="text-green-400 font-medium">
                      {user?.status === 'active' ? 'Activo' : user?.status || 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Verificado:</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Tipo:</span>
                    <span className="text-white">Drover</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de registro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Miembro desde:</span>
                    <span className="text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Último acceso:</span>
                    <span className="text-white">Hoy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tarjetas del usuario (logros/actividad) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/10 border-white/20"><CardContent className="p-4"><div className="flex items-center gap-2 text-white"><Award size={18}/> Medallas</div><div className="text-[#6EF7FF] text-2xl font-bold mt-2">1</div></CardContent></Card>
          <Card className="bg-white/10 border-white/20"><CardContent className="p-4"><div className="flex items-center gap-2 text-white"><Clock3 size={18}/> Tiempo activo</div><div className="text-[#6EF7FF] text-2xl font-bold mt-2">120h</div></CardContent></Card>
          <Card className="bg-white/10 border-white/20"><CardContent className="p-4"><div className="flex items-center gap-2 text-white"><Activity size={18}/> Estado</div><div className="text-green-400 text-2xl font-bold mt-2">En línea</div></CardContent></Card>
        </div>
      </div>
    </div>
  );
};

export default DroverProfile;
