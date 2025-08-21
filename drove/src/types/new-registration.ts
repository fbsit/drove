
export type UserType = 'client' | 'drover';

export interface RegistrationFormData {
  userType: UserType;
  // Campos básicos
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  
  // Campos de identificación
  documentType?: string;
  documentNumber?: string;
  
  // Campos de dirección
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  
  // Campos específicos para drover
  profilePhoto?: File | string;
  licenseFront?: File | string;
  licenseBack?: File | string;
  backgroundCheck?: File | string;
  
  // Campos específicos para cliente
  companyName?: string;
  taxId?: string;
}

// Alias para compatibilidad
export type ClientFormData = RegistrationFormData;
