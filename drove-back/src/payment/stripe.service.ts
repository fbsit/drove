import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');

    if (!key) {
      this.logger.warn(
        'STRIPE_SECRET_KEY no definida. El servicio de pagos funcionará en modo mock.',
      );
      this.stripe = null;
      return;
    }

    const apiVersion = this.config.get<string>('STRIPE_API_VERSION');
    this.stripe = new Stripe(key, {
      apiVersion: (apiVersion as Stripe.LatestApiVersion | undefined) ?? undefined,
      typescript: true,
    });
  }

  /* ═════════════ UTILIDADES ═════════════ */

  /** Crea un Checkout‑Session para un traslado */
  async createCheckoutSession(opts: {
    transferId: string;
    amountEUR: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<string | null> {
    if (!this.stripe) {
      this.logger.debug('⚠️ Mock ‑ createCheckoutSession()', opts);
      return 'mock_session_id';
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(opts.amountEUR * 100), // céntimos
            product_data: {
              name: `Traslado #${opts.transferId}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { transferId: opts.transferId },
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    });

    return session.url ?? null;
  }

  /** Valida la firma de un webhook y devuelve el evento (o null si falla) */
  constructEvent(
    payload: Buffer,
    sig: string | undefined,
  ): Stripe.Event | null {
    if (!this.stripe) return null;

    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET no está configurada');
      return null;
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, sig!, secret);
    } catch (err) {
      this.logger.error('Firma de webhook no válida', err as Error);
      return null;
    }
  }
}
