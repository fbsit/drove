
export interface DriverApplicationData {
  // Información personal
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  codigoPais: string;
  fechaNacimiento?: Date;
  
  // Dirección
  pais: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigoPostal: string;
  
  // Documentación
  nifDniNie: string;
  licenciaConducirAnverso: string;
  licenciaConducirReverso: string;
  certificadoAntecedentes: string;
  aceptarTerminos: boolean;
}

// Esquemas compatibles
export interface CompatibleFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  idNumber?: string;
  driverLicenseFront?: any;
  driverLicenseBack?: any;
  backgroundCheck?: any;
  acceptTerms?: boolean;
}

export const driverStepSchemas = {
  PERSONAL_INFO: 'personal',
  ADDRESS: 'address', 
  DOCUMENTATION: 'documentation',
  CONFIRMATION: 'confirmation'
};
