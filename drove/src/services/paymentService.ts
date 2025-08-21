
import ApiService from './api';

/**
 * Servicio de Pagos
 * Gestiona checkout y procesamiento de pagos
 */
export class PaymentService {
  static async createCheckoutSession(paymentData: any): Promise<any> {
    return await ApiService.post('/payments/checkout', paymentData);
  }

  static async handlePaymentWebhook(webhookData: any): Promise<any> {
    return await ApiService.post('/payments/webhooks', webhookData);
  }
}

export default PaymentService;
