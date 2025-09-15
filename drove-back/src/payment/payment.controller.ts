import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Res,
  Headers,
  Logger,
  HttpCode,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { TravelsService } from './../travels/travels.service'; // ← ajusta el path si difiere
import { Response, Request } from 'express';
import { TransferStatus } from './../travels/entities/travel.entity';
import { ResendService } from '../resend/resend.service';
import { UserService } from 'src/user/user.service';
/* ---------- DTOs ---------- */
export class CreateSessionDto {
  transferId: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  private readonly resend: ResendService;
  private readonly travels: TravelsService;
  private readonly userRepo: UserService;
  constructor(private readonly stripe: StripeService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Crear sesión de pago (Stripe checkout)' })
  @ApiBody({ type: CreateSessionDto })
  @ApiOkResponse({ schema: { example: { url: 'https://checkout.stripe.com/...' } } })
  async createCheckout(@Body() dto: CreateSessionDto) {
    if (!dto.transferId || !dto.amount) {
      throw new BadRequestException('transferId y amount son requeridos');
    }

    const frontendBase = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const base = frontendBase.replace(/\/$/, '');
    const success_url = `${base}/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${base}/payments/cancel`;

    const url = await this.stripe.createCheckoutSession({
      transferId: dto.transferId,
      amountEUR: dto.amount,
      successUrl: success_url,
      cancelUrl: cancel_url,
    });

    if (!url) throw new BadRequestException('No se pudo crear sesión de pago');
    return { url };
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Webhook de Stripe' })
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    const event = this.stripe.constructEvent(req.rawBody as Buffer, sig);
    if (!event) return res.sendStatus(400);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const transferId = session.metadata?.transferId;

        if (transferId) {
          await this.travels.updateStatus(transferId, {
            status: TransferStatus.CREATED, // o el estado que corresponda
          });

          const travel = await this.travels.findOne(transferId);
          if (travel) {
            const paymentDate = new Date().toLocaleDateString('es-ES'); // formato DD/MM/AAAA
            const amount = travel?.totalPrice?.toFixed(2); // asumiendo que travel.amount es un número
            const paymentMethod = travel.paymentMethod; // método de pago usado
            const frontendBase = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
            const transferUrl = `${frontendBase.replace(/\/$/, '')}/cliente/traslados/${transferId}`;
            const opsEmail = process.env.OPERATIONS_EMAIL || process.env.ADMIN_NOTIFICATIONS_EMAIL;
            const userDetails = await this.userRepo.findOneById(
              travel.idClient,
            );
            await this.resend.sendTransferPendingInvoiceEmail(
              opsEmail || 'contacto@drove.es',
              userDetails?.contactInfo?.fullName || '',
              `${travel.brandVehicle} ${travel.modelVehicle} - ${travel.patentVehicle}`,
              travel.startAddress.city,
              travel.endAddress.city,
              travel.travelDate || new Date().toISOString(),
              `https://admin.drove.app/transfers/${travel.id}`,
              'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
            );
            await this.resend.sendPaymentReceivedEmail(
              userDetails?.email || '',
              paymentDate,
              amount ?? '0',
              paymentMethod ?? 'Método no especificado',
              transferId,
              transferUrl,
              'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
            );

            const logo_url = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null';
            const clientInfo = await this.userRepo.findOneById(travel.idClient);
            const client_name =
              clientInfo?.contactInfo?.fullName || 'Cliente desconocido';
            const vehicle = `${travel.brandVehicle} ${travel.modelVehicle} - ${travel.patentVehicle}`;
            const origin = travel.startAddress.city;
            const destination = travel.endAddress.city;
            const transfer_date = new Date().toLocaleDateString('es-ES');
            const admin_transfer_url = `https://admin.drove.app/transfers/${transferId}`;
            await this.resend.sendTransferReadyToAssignEmail(
              opsEmail || 'contacto@drove.es',
              client_name,
              vehicle,
              origin,
              destination,
              transfer_date,
              admin_transfer_url,
              logo_url,
            );
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        this.logger.warn('Pago fallido', event.data.object);
        break;
      }

      default:
        this.logger.debug(`Evento Stripe ignorado: ${event.type}`);
    }

    res.send({ received: true });
  }
}
