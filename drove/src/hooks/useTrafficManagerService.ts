
import { useState, useEffect } from 'react';
import { AdminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

interface TrafficManager {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'invited';
  createdAt: string;
  lastLogin?: string;
}

interface TrafficManagerMetrics {
  total: number;
  active: number;
  invited: number;
}

export const useTrafficManagerService = () => {
  const [managers, setManagers] = useState<TrafficManager[]>([]);

  const [metrics, setMetrics] = useState<TrafficManagerMetrics>({
    total: 0,
    active: 0,
    invited: 0
  });

  useEffect(() => {
    calculateMetrics();
  }, [managers]);



  const fetchManagers = async () => {
    try {
      const data = await AdminService.getTrafficManagers();
      setManagers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al obtener los jefes de tráfico",
        description: "Verifica tu conexión o vuelve a intentarlo.",
      });
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const calculateMetrics = () => {
    const total = managers.length;
    const active = managers.filter(m => m.status === 'active').length;
    const invited = managers.filter(m => m.status === 'invited').length;

    setMetrics({ total, active, invited });
  };

  const inviteManager = async (email: string) => {
    try {
      const newManager: TrafficManager = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        status: 'invited',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setManagers(prev => [...prev, newManager]);

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la invitación"
      });
    }
  };

  const updateManager = async (id: string, updates: Partial<TrafficManager>) => {
    try {
      setManagers(prev => prev.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ));

      toast({
        title: "Actualizado",
        description: "Jefe de Tráfico actualizado correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el Jefe de Tráfico"
      });
    }
  };

  const activateManager = async (id: string) => {
    await updateManager(id, { status: 'active' });
  };

  const deactivateManager = async (id: string) => {
    await updateManager(id, { status: 'inactive' });
  };

  const deleteManager = async (id: string) => {
    try {
      setManagers(prev => prev.filter(m => m.id !== id));

      toast({
        title: "Eliminado",
        description: "Jefe de Tráfico eliminado correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el Jefe de Tráfico"
      });
    }
  };

  const resendInvite = async (id: string) => {
    try {
      toast({
        title: "Invitación reenviada",
        description: "Se ha reenviado la invitación"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reenviar la invitación"
      });
    }
  };

  return {
    managers,
    metrics,
    inviteManager,
    updateManager,
    activateManager,
    deactivateManager,
    deleteManager,
    resendInvite
  };
};
