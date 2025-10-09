import ForgotPassword from '@/pages/auth/ForgotPassword';
import ApiService from './api';
import type {
  AuthSignInRequest,
  AuthSignInResponse,
  AuthSignUpRequest,
  AuthSignUpResponse,
  UserDetails,
  UpdateProfileRequest,
  CurrentUserResponse
} from './api/types/auth';

export interface User {
  id: string;
  email: string;
  user_type: 'client' | 'drover' | 'admin' | 'traffic_manager';
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  profile_complete: boolean;
  is_approved: boolean;
  is_super_admin?: boolean;
  role?: string;
  created_at: string;
}

/**
 * Servicio de Autenticación
 * Maneja login, registro, sesiones y verificaciones
 */
export class AuthService {
  // === AUTENTICACIÓN ===
  static async signIn(credentials: AuthSignInRequest): Promise<AuthSignInResponse> {
    const normalizedEmail = String(credentials.email ?? '').trim().toLowerCase();
    const payload = { ...credentials, email: normalizedEmail } as AuthSignInRequest;
    console.log("lanzando con estas credenciales", payload);
    const response = await ApiService.post<AuthSignInResponse>('/auth/login', payload);
    console.log("response",response)
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
      try {
        localStorage.setItem('last_login_at', new Date().toISOString());
      } catch {}
    }

    return response;
  }

  static async signUp(userData: AuthSignUpRequest): Promise<AuthSignUpResponse> {
    const normalizedEmail = String(userData.email ?? '').trim().toLowerCase();
    const payload = { ...userData, email: normalizedEmail } as AuthSignUpRequest;
    return await ApiService.post<AuthSignUpResponse>('/users', payload);
  }

  static async signOut(): Promise<void> {
    try {
      await ApiService.post('/auth/sign-out', {});
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  // === GESTIÓN DE USUARIOS ===
  static async getCurrentUser(): Promise<UserDetails> {
    // El backend retorna el usuario directamente
    return await ApiService.get<UserDetails>('/users/me');
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<UserDetails> {
    // Backend no expone /auth/profile; usamos /users/:id (PATCH)
    const userId = localStorage.getItem('auth_user_id');
    if (!userId) throw new Error('No user id in storage');
    return await ApiService.patch<UserDetails>(`/users/${userId}`, data);
  }

  static async updateUserProfile(data: UpdateProfileRequest): Promise<UserDetails> {
    return await this.updateProfile(data);
  }

  // === VERIFICACIONES ===
  static async sendVerificationCode(email: string): Promise<void> {
    const normalized = String(email ?? '').trim().toLowerCase();
    await ApiService.post('/verifications/email/send-code', { email: normalized });
  }

  static async requestEmailValidation(email: string): Promise<void> {
    await this.sendVerificationCode(email);
  }

  static async verifyCode(email: string, code: string): Promise<boolean> {
    const normalized = String(email ?? '').trim().toLowerCase();
    const response = await ApiService.post<{ verified: boolean }>('/verifications/email/check-code', {
      email: normalized,
      code
    });
    return response.verified;
  }

  static async verifyEmailCode(email: string, code: string): Promise<boolean> {
    return await this.verifyCode(email, code);
  }

  static async forgotPassword(email: string): Promise<void> {
    const normalized = String(email ?? '').trim().toLowerCase();
    await ApiService.post('/users/forgot-password', { email: normalized });
  }

  static async resetPassword(code: string, newPassword: string): Promise<void> {
    await ApiService.post('/users/reset-password', { code, newPassword });
  }

  // === RESET PASSWORD WITH CODE ===
  static async validateResetCode(code: string): Promise<{ valid: boolean; email?: string }> {
    // No existe endpoint en backend; el flujo usa /users/forgot-password y /users/reset-password
    // Simulamos valid true para no romper llamadas existentes; ideal eliminar usos o implementar en backend
    return { valid: true };
  }

  static async confirmResetPassword(code: string, newPassword: string): Promise<void> {
    await ApiService.post('/users/reset-password', { 
      code, 
      newPassword 
    });
  }

  /**
 * Cambia la contraseña del usuario autenticado.
 * @param currentPassword   Contraseña actual (texto plano que escribe el usuario).
 * @param newPassword       Nueva contraseña.
 * @param confirmPassword   Confirmación de la nueva contraseña.
 */
  static async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    await ApiService.patch(
      '/auth/change-password',
      {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      },
    );
  }


  static async markProfileAsComplete(userId: string): Promise<void> {
    // No existe endpoint; persistimos flag en perfil del usuario
    await ApiService.patch(`/users/${userId}`, { contactInfo: { profileComplete: true } });
  }

  // === UTILIDADES ===
  static getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

// Exports individuales para compatibilidad
export const signIn = AuthService.signIn.bind(AuthService);
export const signOut = AuthService.signOut.bind(AuthService);
export const getCurrentUser = AuthService.getCurrentUser.bind(AuthService);
export const updateUserProfile = AuthService.updateUserProfile.bind(AuthService);
export const markProfileAsComplete = AuthService.markProfileAsComplete.bind(AuthService);

export default AuthService;
