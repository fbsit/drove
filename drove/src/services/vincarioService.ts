import ApiService from './api';

export interface VincarioResponse {
  success: boolean;
  data?: {
    make: string;
    model: string;
    year: string;
    vin: string;
  };
  error?: string;
}

export interface VincarioValidationState {
  vinValidated: boolean;
  vinData: { make: string; model: string; year: string; vin: string } | null;
  validating: boolean;
  cooldownUntil: Date | null;
  error: string | null;
}

class VincarioService {
  async validateVin(vin: string): Promise<VincarioResponse> {
    try {
      console.log(`[VINCARIO] Validando VIN: ${vin}`);
      const data = await ApiService.post<VincarioResponse>('/vincario/decode', { 
        vin: vin.toUpperCase() 
      });
      console.log(`[VINCARIO] Respuesta recibida:`, data);
      return data;
    } catch (error: any) {
      console.error('Error validating VIN:', error);
      
      // Manejar errores específicos
      if (error.status === 429) {
        return {
          success: false,
          error: 'Demasiadas solicitudes. Espera 30 segundos'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Error de conexión. Intenta nuevamente'
      };
    }
  }

  // Helper para validar formato VIN en frontend
  validateVinFormat(vin: string): boolean {
    if (!vin || vin.length !== 17) return false;
    
    // VIN no debe contener I, O, Q
    const invalidChars = /[IOQ]/;
    return !invalidChars.test(vin);
  }

  // Helper para calcular tiempo restante de cooldown
  getCooldownRemaining(cooldownUntil: Date | null): number {
    if (!cooldownUntil) return 0;
    const now = new Date();
    const remaining = Math.max(0, Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000));
    return remaining;
  }

  // Helper para formatear tiempo en formato MM:SS
  formatCooldownTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export default new VincarioService();
