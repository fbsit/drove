
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  full_name?: string; // Propiedad opcional para compatibilidad
  role?: string;
  document_id?: string;
  phone?: string;
  user_type?: 'client' | 'drover' | 'admin' | 'traffic_manager'; // Restringimos los valores permitidos
  profile_complete?: boolean;
  is_approved?: boolean;
  is_super_admin?: boolean; // Agregada la propiedad faltante
  created_at?: string;
  document_type?: string;
  company_name?: string;
  // Propiedades adicionales que pueden ser necesarias para compatibilidad con AddressValue
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // Propiedades del drover
  licenseFront?: File | string;
  licenseBack?: File | string;
  selfie?: File | string;
  imageUpload2?: File | string;
  pdfUpload?: File | string;
  // Información de contacto agregada para compatibilidad con Header
  contactInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export interface AuthSignInData {
  email: string;
  password: string;
}

export interface AuthSignUpData {
  email: string;
  password: string;
  userType: 'client' | 'drover';
  contactInfo: ContactInfo;
}

export interface ContactInfo {
  fullName: string;
  email?: string;
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
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthSignInData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: AuthSignUpData) => Promise<void>;
  refreshUser: () => Promise<void>;
  getRedirectPathForUser: () => string;
  updateProfile: (data: Partial<User>) => Promise<void>;
  completeProfile: () => Promise<void>;
  needsProfileCompletion: boolean;
  sendVerificationCode: (email: string) => Promise<void>;
  checkVerificationCode: (email: string, code: string) => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
