
import ApiService from './api';

/**
 * Servicio de Verificaciones
 * Gestiona verificación de email y códigos
 */
export class VerificationService {
  static async sendEmailVerificationCode(email: string): Promise<any> {
    return await ApiService.post('/verifications/email/send-code', { email });
  }

  static async checkEmailVerificationCode(email: string, code: string): Promise<any> {
    return await ApiService.post('/verifications/email/check-code', { email, code });
  }
}

export default VerificationService;
