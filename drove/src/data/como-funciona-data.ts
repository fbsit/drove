
import { 
  Smartphone, 
  Search, 
  MapPin, 
  CreditCard, 
  CheckCircle,
  Shield,
  Clock,
  Star,
  Users
} from 'lucide-react';

export const steps = [
  {
    id: 1,
    title: "Solicita tu servicio",
    description: "Ingresa los detalles de tu vehículo y destino en nuestra plataforma",
    icon: Smartphone,
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    iconColor: "text-blue-400",
    details: [
      "Completa el formulario con datos del vehículo",
      "Especifica origen y destino",
      "Selecciona fecha y hora preferida"
    ]
  },
  {
    id: 2,
    title: "Encuentra tu drover",
    description: "Te conectamos con drovers profesionales verificados en tu zona",
    icon: Search,
    color: "from-green-500/20 to-green-500/5 border-green-500/30",
    iconColor: "text-green-400",
    details: [
      "Búsqueda automática de drovers disponibles",
      "Perfiles verificados y con reseñas",
      "Selección basada en ubicación y disponibilidad"
    ]
  },
  {
    id: 3,
    title: "Confirma y paga",
    description: "Revisa los detalles y realiza el pago de forma segura",
    icon: CreditCard,
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
    iconColor: "text-purple-400",
    details: [
      "Precio transparente sin sorpresas",
      "Múltiples métodos de pago",
      "Transacciones 100% seguras"
    ]
  },
  {
    id: 4,
    title: "Seguimiento en tiempo real",
    description: "Monitorea tu vehículo durante todo el trayecto",
    icon: MapPin,
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
    iconColor: "text-orange-400",
    details: [
      "GPS en tiempo real",
      "Notificaciones de progreso",
      "Comunicación directa con el drover"
    ]
  },
  {
    id: 5,
    title: "Recibe tu vehículo",
    description: "Tu vehículo llega seguro a su destino",
    icon: CheckCircle,
    color: "from-teal-500/20 to-teal-500/5 border-teal-500/30",
    iconColor: "text-teal-400",
    details: [
      "Inspección final del vehículo",
      "Documentación de entrega",
      "Califica tu experiencia"
    ]
  }
];

export const benefits = [
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Drovers verificados y seguros completos",
    color: "text-blue-400"
  },
  {
    icon: Clock,
    title: "Rápido y Eficiente",
    description: "Conexión inmediata con drovers disponibles",
    color: "text-green-400"
  },
  {
    icon: Star,
    title: "Calidad Garantizada",
    description: "Sistema de reseñas y calificaciones",
    color: "text-purple-400"
  },
  {
    icon: Users,
    title: "Soporte 24/7",
    description: "Atención al cliente cuando lo necesites",
    color: "text-orange-400"
  }
];
