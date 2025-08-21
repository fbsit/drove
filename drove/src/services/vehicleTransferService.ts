
import TransferService from './transferService';
import { CreateTransferRequest, CreateTransferResponse, TransferDetail } from './api/types/transfers';

/**
 * Servicio de Traslado de Vehículos
 * Wrapper específico para traslados de vehículos usando TransferService
 */
export class VehicleTransferService {
  static async createTransfer(data: CreateTransferRequest): Promise<CreateTransferResponse> {
    return await TransferService.createTravel(data);
  }

  static async getClientTransfers(clientId: string): Promise<any[]> {
    try {
      return await TransferService.getTravelsByClient(clientId);
    } catch (error) {
      console.error('Error al obtener traslados del cliente:', error);
      return [];
    }
  }

  static async getTransferDetail(transferId: string): Promise<TransferDetail> {
    return await TransferService.getTravelById(transferId);
  }

  static async updateTransferStatus(transferId: string, status: string): Promise<void> {
    await TransferService.updateTravelStatus(transferId, status);
  }

  static async getVehicleTransfer(transferId: string): Promise<any> {
    return await TransferService.getTravelById(transferId);
  }

  static async saveDeliveryVerification(transferId: string, data: any): Promise<boolean> {
    try {
      await TransferService.saveDeliveryVerification(transferId, data);
      return true;
    } catch (error) {
      console.error('Error al guardar verificación de entrega:', error);
      return false;
    }
  }

  static async savePickupVerification(transferId: string, data: any): Promise<boolean> {
    try {
      await TransferService.savePickupVerification(transferId, data);
      return true;
    } catch (error) {
      console.error('[PICKUP_VERIFICATION] ❌ Error al guardar verificación de recogida:', error);
      throw error;
    }
  }
}

// Re-exports para compatibilidad
export const getVehicleTransfer = VehicleTransferService.getVehicleTransfer;
export const saveDeliveryVerification = VehicleTransferService.saveDeliveryVerification;
export const savePickupVerification = VehicleTransferService.savePickupVerification;
export const updateTransferStatus = VehicleTransferService.updateTransferStatus;

export default VehicleTransferService;
