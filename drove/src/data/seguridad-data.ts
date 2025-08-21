
import { 
  Shield, 
  CheckCircle, 
  Eye, 
  Lock, 
  FileText, 
  UserCheck, 
  Camera, 
  Phone,
  AlertTriangle,
  MapPin,
  Award
} from 'lucide-react';

export const securityFeatures = [
  {
    icon: UserCheck,
    title: "Drovers Verificados",
    description: "Todos nuestros drovers pasan por un riguroso proceso de verificación",
    details: [
      "Verificación de identidad completa",
      "Antecedentes penales limpios",
      "Licencia de conducir válida",
      "Referencias laborales verificadas"
    ],
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    iconColor: "text-blue-400"
  },
  {
    icon: Shield,
    title: "Seguros Completos",
    description: "Tu vehículo está protegido durante todo el trayecto",
    details: [
      "Seguro de responsabilidad civil",
      "Cobertura por daños materiales",
      "Protección contra robo",
      "Asistencia en carretera 24/7"
    ],
    color: "from-green-500/20 to-green-500/5 border-green-500/30",
    iconColor: "text-green-400"
  },
  {
    icon: MapPin,
    title: "Seguimiento GPS",
    description: "Monitoreo en tiempo real de tu vehículo",
    details: [
      "Ubicación exacta en tiempo real",
      "Historial completo del recorrido",
      "Alertas automáticas de desviaciones",
      "Notificaciones de progreso"
    ],
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
    iconColor: "text-purple-400"
  },
  {
    icon: Camera,
    title: "Documentación Fotográfica",
    description: "Registro visual completo del proceso",
    details: [
      "Fotos del vehículo antes de la recogida",
      "Documentación del estado actual",
      "Fotos de entrega al destinatario",
      "Firmas digitales de conformidad"
    ],
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
    iconColor: "text-orange-400"
  }
];

export const certifications = [
  {
    icon: Award,
    title: "ISO 27001",
    description: "Certificación en seguridad de la información"
  },
  {
    icon: Lock,
    title: "SSL/TLS",
    description: "Encriptación de datos end-to-end"
  },
  {
    icon: FileText,
    title: "RGPD",
    description: "Cumplimiento con normativas de protección de datos"
  },
  {
    icon: Eye,
    title: "Auditorías",
    description: "Revisiones de seguridad periódicas"
  }
];

export const emergencySteps = [
  {
    step: 1,
    title: "Contacta inmediatamente",
    description: "Llama a nuestro número de emergencia 24/7",
    icon: Phone
  },
  {
    step: 2,
    title: "Localización automática",
    description: "Activamos el seguimiento GPS prioritario",
    icon: MapPin
  },
  {
    step: 3,
    title: "Protocolo de seguridad",
    description: "Iniciamos procedimientos de emergencia",
    icon: AlertTriangle
  },
  {
    step: 4,
    title: "Resolución rápida",
    description: "Equipo especializado se hace cargo",
    icon: CheckCircle
  }
];
