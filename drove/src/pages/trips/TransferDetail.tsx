import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  Package,
  AlertCircle
} from 'lucide-react';
import { TransferService } from '@/services/transferService';

interface TransferData {
  id: string;
  status: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  amount: number;
  vehicleDetails: {
    type: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: string;
  };
  clientInfo: {
    name: string;
    phone: string;
    email: string;
  };
  senderInfo: {
    name: string;
    phone: string;
  };
  receiverInfo: {
    name: string;
    phone: string;
  };
  droverInfo?: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

const TransferDetail = () => {
  const { id: transferId } = useParams();
  const navigate = useNavigate();
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // id proviene de la ruta /traslados/:id

  useEffect(() => {
    if (transferId) {
      loadTransferData();
    }
  }, [transferId]);

  const loadTransferData = async () => {
    try {
      setLoading(true);
      const response = await TransferService.getTravelById(transferId!);

      // Mapear la respuesta de la API al formato esperado
      const mappedData: TransferData = {
        id: response?.id || transferId!,
        status: response?.status || 'pendiente',
        pickupAddress: response?.startAddress?.address || response?.startAddress?.city || '',
        destinationAddress: response?.endAddress?.address || response?.endAddress?.city || '',
        pickupDate: response?.travelDate || '',
        pickupTime: response?.travelTime || '',
        amount: Number(response?.totalPrice ?? 0),
        vehicleDetails: {
          type: response?.typeVehicle || response?.vehicleDetails?.type || '',
          licensePlate: response?.patentVehicle || response?.licensePlate || response?.vehicleDetails?.licensePlate || '',
          brand: response?.brandVehicle || response?.vehicleDetails?.brand || '',
          model: response?.modelVehicle || response?.vehicleDetails?.model || '',
          year: response?.yearVehicle || response?.vehicleDetails?.year || '',
        },
        clientInfo: {
          name: response?.client?.contactInfo?.fullName || response?.client_name || '',
          phone: response?.client?.contactInfo?.phone || response?.client_phone || '',
          email: response?.client?.email || response?.client_email || '',
        },
        senderInfo: {
          name: response?.personDelivery?.fullName || response?.sender_name || '',
          phone: response?.personDelivery?.phone || response?.sender_phone || '',
        },
        receiverInfo: {
          name: response?.personReceive?.fullName || response?.receiver_name || '',
          phone: response?.personReceive?.phone || response?.receiver_phone || '',
        },
        droverInfo: response?.drover ? {
          name: response?.drover?.contactInfo?.fullName || response?.drover_name || '',
          phone: response?.drover?.contactInfo?.phone || response?.drover_phone || '',
        } : undefined,
        createdAt: response?.created_at || response?.createdAt || new Date().toISOString(),
      };

      setTransferData(mappedData);
    } catch (error) {
      console.error('Error al cargar el traslado:', error);
      setError('No se pudo cargar la información del traslado');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-500';
      case 'en_progreso': return 'bg-blue-500';
      case 'asignado': return 'bg-yellow-500';
      case 'pendiente': return 'bg-orange-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'en_progreso': return 'En Progreso';
      case 'asignado': return 'Asignado';
      case 'pendiente': return 'Pendiente';
      case 'cancelado': return 'Cancelado';
      default: return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#22142A] p-4 flex items-center justify-center">
        <div className="text-white">Cargando traslado...</div>
      </div>
    );
  }

  if (error || !transferData) {
    return (
      <div className="min-h-screen bg-[#22142A] p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl mb-2">Error</h2>
          <p className="text-white/70 mb-4">{error || 'No se encontró el traslado'}</p>
          <Button onClick={() => navigate('/cliente/traslados')} variant="outline" className='hidden'>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left ">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/cliente/traslados')}
              className='hidden'
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="lg:text-left text-2xl font-bold text-white">Detalle del Traslado</h1>
              <p className="text-white/70">#{transferData.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`${getStatusColor(transferData.status)} text-white`}>
              {getStatusText(transferData.status)}
            </Badge>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#6EF7FF]">€{transferData.amount}</p>
              <p className="text-white/60 text-sm">Precio total</p>
            </div>
          </div>
        </div>

        {/* Información del recorrido */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin size={20} />
              Información del Recorrido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-green-500 rounded-full p-2">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Origen</p>
                    <p className="text-white">{transferData.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-500 rounded-full p-2">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Destino</p>
                    <p className="text-white">{transferData.destinationAddress}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={16} className="text-[#6EF7FF]" />
                  <div>
                    <p className="text-white/60 text-sm">Fecha de recogida</p>
                    <p className="text-white">{transferData.pickupDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#6EF7FF]" />
                  <div>
                    <p className="text-white/60 text-sm">Hora de recogida</p>
                    <p className="text-white">{transferData.pickupTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del vehículo */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Car size={20} />
              Información del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 text-sm">Tipo</p>
                <p className="text-white capitalize">{transferData.vehicleDetails.type}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Matrícula</p>
                <p className="text-white">{transferData.vehicleDetails.licensePlate}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Marca</p>
                <p className="text-white">{transferData.vehicleDetails.brand}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Modelo</p>
                <p className="text-white">{transferData.vehicleDetails.model} {transferData.vehicleDetails.year}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de contactos */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Cliente */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <User size={18} />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white font-semibold">{transferData.clientInfo.name}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#6EF7FF]" />
                  <span className="text-white/70 text-sm">{transferData.clientInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#6EF7FF]" />
                  <span className="text-white/70 text-sm">{transferData.clientInfo.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remitente */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Package size={18} />
                Remitente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white font-semibold">{transferData.senderInfo.name}</p>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#6EF7FF]" />
                <span className="text-white/70 text-sm">{transferData.senderInfo.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Destinatario */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <User size={18} />
                Destinatario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white font-semibold">{transferData.receiverInfo.name}</p>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#6EF7FF]" />
                <span className="text-white/70 text-sm">{transferData.receiverInfo.phone}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drover asignado */}
        {transferData.droverInfo && (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User size={20} />
                Drover Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{transferData.droverInfo.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-[#6EF7FF]" />
                    <span className="text-white/70 text-sm">{transferData.droverInfo.phone}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Phone size={16} className="mr-2" />
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Fecha de creación</p>
                <p className="text-white">{new Date(transferData.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">ID del traslado</p>
                <p className="text-white">#{transferData.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferDetail;
