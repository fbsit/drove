
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getVehicleTransfer } from '@/services/vehicleTransferService';
import { Loader } from 'lucide-react';

const QRRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Esperamos a que la autenticación esté lista
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Inicia sesión para ver los detalles del traslado"
      });
      
      // Guardar el ID del traslado para redirigir después de login
      if (code) {
        sessionStorage.setItem('redirect_after_login', `/qr/${code}`);
      }
      
      navigate('/login');
      return;
    }

    if (!code) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "ID de traslado no proporcionado"
      });
      navigate('/drover/dashboard');
      return;
    }

    const loadTransfer = async () => {
      try {
        const transfer = await getVehicleTransfer(code);

        if (!transfer) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Traslado no encontrado"
          });
          navigate('/drover/dashboard');
          return;
        }

        // Verificar si el usuario actual es el conductor asignado a este traslado
        const isDriverAssigned = transfer && user?.id && user?.user_type === 'drover' &&
          ((transfer.droverId && String(transfer.droverId) === String(user.id)) || (transfer.driverId && String(transfer.driverId) === String(user.id)));

        if (isDriverAssigned) {
          // Decidir destino según estado del traslado
          const status: string = transfer.status || '';
          const id = String(transfer.id || code);
          const isPickupFlow = status === 'ASSIGNED' || status === 'CREATED' || status === 'PENDINGPAID';
          const isDeliveryFlow = status === 'PICKED_UP' || status === 'IN_PROGRESS' || status === 'REQUEST_FINISH';

          if (isPickupFlow) {
            navigate(`/verificacion/recogida/${id}`);
          } else if (isDeliveryFlow) {
            navigate(`/verificacion/entrega/${id}`);
          } else {
            // Fallback a detalle del traslado activo
            navigate(`/traslados/activo/${id}`);
          }
        } else if (user?.user_type === 'admin') {
          // Redirigir al administrador a la página de detalles del traslado en el panel de administración
          navigate(`/admin/traslados/${code}`);
        } else {
          // Mostrar un mensaje de error si el usuario no tiene permisos
          toast({
            variant: "destructive",
            title: "Acceso denegado",
            description: "No tienes permisos para acceder a este traslado"
          });
          
          // Redirigir al dashboard correspondiente según el tipo de usuario
          if (user?.user_type === 'client') {
            navigate('/cliente/dashboard');
          } else if (user?.user_type === 'drover') {
            navigate('/drover/dashboard');
          } else {
            navigate('/admin/dashboard');
          }
        }
      } catch (error) {
        console.error('Error al cargar el traslado:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del traslado"
        });
        
        // Redirigir al dashboard correspondiente según el tipo de usuario
        if (user?.user_type === 'client') {
          navigate('/cliente/dashboard');
        } else if (user?.user_type === 'drover') {
          navigate('/drover/dashboard');
        } else {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTransfer();
  }, [transferId, user, navigate, toast, isAuthenticated, authLoading]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#22142A]">
      <Loader className="h-12 w-12 text-[#6EF7FF] animate-spin" />
      <p className="text-white mt-4">Redirigiendo...</p>
    </div>
  );
};

export default QRRedirect;
