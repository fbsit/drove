
import ApiService from './api';
import { VehicleTransferFormData } from '@/types/vehicle-transfer-request';


export class TransferService {
  static async getTransfers(): Promise<any[]> {
    return await ApiService.get('/travels');
  }

  static async getTransferById(transferId: string): Promise<any> {
    return await ApiService.get(`/travels/${transferId}`);
  }

  static async createTransfer(transferData: VehicleTransferFormData): Promise<any> {
    const anyData = transferData as any;
    const signatureStartClient = anyData?.signatureStartClient
      ?? anyData?.transferDetails?.signature
      ?? anyData?.signature
      ?? '';

    const payload = {
      ...anyData,
      ...(signatureStartClient ? { signatureStartClient } : {}),
    };

    return await ApiService.post('/travels', payload);
  }

  static async updateTransfer(transferId: string, transferData: Partial<VehicleTransferFormData>): Promise<any> {
    return await ApiService.patch(`/travels/${transferId}`, transferData);
  }

  static async deleteTransfer(transferId: string): Promise<void> {
    // No hay DELETE en backend; marcamos como CANCELLED
    await ApiService.patch(`/travels/${transferId}/status`, { status: 'CANCELLED' });
  }

  static async createTravel(data: any): Promise<any> {
    console.log('data', data);
    const typeVehicle = data?.vehicleDetails?.type ?? data?.typeVehicle;
    const signatureStartClient = (data as any)?.signatureStartClient
      ?? (data as any)?.transferDetails?.signature
      ?? (data as any)?.signature
      ?? '';

    const payload = {
      ...data,
      typeVehicle,
      ...(signatureStartClient ? { signatureStartClient } : {}),
      vehicleDetails: {
        ...data?.vehicleDetails,
        type: typeVehicle,
      },
    };
    console.log('payload', payload);
    return await ApiService.post('/travels', payload);
  }

  static async getTravelsByClient(clientId: string): Promise<any[]> {
    const response = await ApiService.get(`/travels/client/${clientId}`);
    return Array.isArray(response) ? response : [];
  }

  static async getTravelById(travelId: string): Promise<any> {
    return await ApiService.get(`/travels/${travelId}`);
  }

  static async updateTravelStatus(travelId: string, status: string): Promise<void> {
    await ApiService.patch(`/travels/${travelId}/status`, { status });
  }


  static async saveDeliveryVerification(travelId: string, data: any): Promise<any> {
    return await ApiService.post(`/travels/${travelId}/verification/delivery`, data);
  }

  static async savePickupVerification(travelId: string, data: any): Promise<any> {
    return await ApiService.post(`/travels/${travelId}/verification/pickup`, data);
  }

  static async saveInitTravelVerification(travelId: string): Promise<any> {
    return await ApiService.patch(`/travels/${travelId}/verification/startTravel`);
  }
  
  static async saveFinishTravelVerification(
    travelId: string,
    data?: { polyline: string; currentLat?: number | null; currentLng?: number | null },
  ): Promise<any> {
    return await ApiService.patch(`/travels/${travelId}/verification/finishTravel`, data);
  }

  static async rescheduleTransfer(transferId: string, data: { travelDate: string, travelTime: string }): Promise<any> {
    return await ApiService.patch(`/travels/${transferId}/reschedule`, data);
  }
}

export const createTravel = async (data: any, userId?: string) => {
  const travelData = { ...data, idClient: userId };
  return TransferService.createTravel(travelData);
};

export default TransferService;
