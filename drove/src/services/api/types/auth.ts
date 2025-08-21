
/**
 * Tipos para el servicio de autenticación
 */

// Datos para inicio de sesión
export interface AuthSignInRequest {
  email: string;
  password: string;
}

// Respuesta del inicio de sesión
export interface AuthSignInResponse {
  access_token: string;
  expiresIn: string;
  user: {
    email: string;
    id: string;
    name?: string;
    user_type?: 'client' | 'drover' | 'admin' | 'traffic_manager';
    role?: string; // Añadido para manejar respuestas de la API
    profile_complete?: boolean;
  };
}

// Datos de contacto para registro
export interface ContactInfo {
  fullName: string;
  phone?: string;
  documentId?: string;
  documentType?: string;
  profileComplete?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  identificationNumber?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  licenseFront?: File | string;
  licenseBack?: File | string;
  selfie?: File | string;
  imageUpload2?: File | string;
  pdfUpload?: File | string;
  latitud?: string;
  longitud?: string;
  phones?: string;
  email?: string;
  [key: string]: any; // Para permitir propiedades adicionales
}

// Datos para registro
export interface AuthSignUpRequest {
  email: string;
  password: string;
  userType: 'client' | 'drover';
  contactInfo: ContactInfo;
}

// Respuesta del registro
export interface AuthSignUpResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

// Detalles del usuario
export interface UserDetails {
  id: string;
  email: string;
  user_type: 'client' | 'drover' | 'admin' | 'traffic_manager';
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  document_id: string | null;
  document_type: string | null;
  created_at: string;
  profile_complete: boolean;
  is_approved: boolean;
  is_super_admin?: boolean;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  role?: string; // Añadido para compatibilidad con la API
  // Campos de drover
  licenseFront?: string;
  licenseBack?: string;
  selfie?: string;
  imageUpload2?: string;
  pdfUpload?: string;
}

// Datos para actualizar el perfil
export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  company_name?: string;
  document_id?: string;
  document_type?: string;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  [key: string]: any;
}

// Respuesta del perfil actual
export interface CurrentUserResponse {
  session: {
    access_token: string;
    expiresIn: string;
  } | null;
  user: UserDetails | null;
  user_type?: string;
  role?: string;
}
