// src/resend/resend.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Travels } from './../travels/entities/travel.entity';
import { PdfService } from '../pdf/pdf.service';
import { CompensationService } from '../rates/compensation.service';
import fetch from 'node-fetch';

export interface ResendSendEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string | string[];
  headers?: Record<string, string>;
  attachments?: any[];
}

interface Payload {
  to: string | string[];
  subject: string;
  // — variables que usas en el HTML —
  preheader: string;
  logo_url: string;
  qr_code_url: string;
  driver_name: string;
  driver_phone: string;
  pickup_date: string;
  pickup_time: string;
  client_name: string;
  request_id: string;
  vehicle_type: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  vin: string;
  // datos del remitente (persona que entrega)
  holder_name?: string;
  holder_phone?: string;
  // datos cliente
  client_phone?: string;
  // datos del receptor (persona que recibe)
  receiver_name?: string;
  receiver_phone?: string;
  receiver_dni?: string;
  receiver_nif?: string;
  // otros
  transport_id?: string;
  holder_signature_url?: string;
  driver_signature_url?: string;
  doc_issue_date?: string;
  // entrega
  delivery_date?: string;
  delivery_time?: string;
  reception_time?: string;
  client_signature_url?: string;
  pickup_address: {
    street: string;
    postal_code: string;
    city: string;
    region: string;
    country: string;
  };
  delivery_address: {
    street: string;
    postal_code: string;
    city: string;
    region: string;
    country: string;
  };
  distance: number;
  total_with_tax: string;
  issue_date: string;
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly client: Resend | null;
  private readonly compiledTemplates: Record<
    string,
    HandlebarsTemplateDelegate
  > = {};
  // Rate limit: max 2 req/s → serialize sends and space them
  private sendQueue: Promise<any> = Promise.resolve();
  private sendTimestamps: number[] = [];

  constructor(private readonly config: ConfigService, private readonly pdfService: PdfService, private readonly compensation: CompensationService) {
    const apiKey = 're_dikLWbNB_2tg41mPRK8UCuUcybKSwEiw1';

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY no está definido. El envío de correos será ignorado.',
      );
      this.client = null; // modo mock
      return;
    }

    this.client = new Resend(apiKey);
  }

  private localizeInvoiceStatus(status: string | undefined | null): string {
    const key = String(status || '').toUpperCase();
    const map: Record<string, string> = {
      DRAFT: 'Borrador',
      SENT: 'Emitida',
      PAID: 'Pagada',
      VOID: 'Anulada',
      REJECTED: 'Rechazada',
      ADVANCE: 'Anticipo',
    };
    return map[key] || (status || '');
  }

  private loadTemplate(name: string): HandlebarsTemplateDelegate {
    if (this.compiledTemplates[name]) return this.compiledTemplates[name];

    let filePath = path.join(__dirname, 'templates', `${name}.html`);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(
        process.cwd(),
        'src',
        'resend',
        'templates',
        `${name}.html`,
      );
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const compiled = Handlebars.compile(raw);
    this.compiledTemplates[name] = compiled;
    return compiled;
  }

  private buildFrontUrl(pathOrUrl: string): string {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    if (!pathOrUrl) return baseUrl.replace(/\/$/, '');
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const sep = pathOrUrl.startsWith('/') ? '' : '/';
    return `${baseUrl.replace(/\/$/, '')}${sep}${pathOrUrl}`;
  }

  private buildVerificationPath(usePage: 'withdrawals' | 'delivery', id: string): string {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const base = baseUrl.replace(/\/$/, '');
    const path = usePage === 'withdrawals' ? '/verificacion/recogida/' : '/verificacion/entrega/';
    return `${base}${path}${encodeURIComponent(id)}`;
  }

  /* ============== NUEVOS: Notificaciones de estado de factura ============== */
  async sendInvoiceStatusEmailClient(payload: { email: string; name: string; status: string; invoiceNumber?: string; amount?: number; invoiceUrl?: string; travelId?: string; updatedAt?: string; }) {
    if (!this.client) return false;
    const statusEs = this.localizeInvoiceStatus(payload.status);
    const subject = `Estado de tu factura: ${statusEs}`;
    const html = `
      <table cellspacing="0" cellpadding="0" width="100%">
        <tr><td align="center">
          <table width="600" cellspacing="0" cellpadding="20" style="background:#1a1122;border-radius:10px;color:#fff">
            <tr><td align="center"><img width="160" alt="DROVE" src="https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null"></td></tr>
            <tr><td>
              <h2 style="color:#6EF7FF;margin:0 0 8px">Actualización de factura</h2>
              <p>Hola ${payload.name || 'cliente'}, tu factura ha cambiado al estado <strong>${statusEs}</strong>.</p>
              ${payload.invoiceNumber ? `<p>N° de factura: <strong>${payload.invoiceNumber}</strong></p>` : ''}
              ${payload.amount != null ? `<p>Monto: €${Number(payload.amount || 0).toFixed(2)}</p>` : ''}
              ${payload.travelId ? `<p>Traslado: ${payload.travelId}</p>` : ''}
              ${payload.updatedAt ? `<p>Fecha: ${payload.updatedAt}</p>` : ''}
              ${payload.invoiceUrl ? `<p><a href="${payload.invoiceUrl}" style="background:#6EF7FF;color:#22142A;padding:10px 16px;border-radius:8px;text-decoration:none">Ver factura</a></p>` : ''}
            </td></tr>
          </table>
        </td></tr>
      </table>`;
    await this.client.emails.send({ from: 'contacto@drove.es', to: payload.email, subject, html });
    return true;
  }

  async sendInvoiceStatusEmailAdmin(payload: { email?: string; status: string; invoiceNumber?: string; amount?: number; travelId?: string; updatedAt?: string; clientEmail?: string; }) {
    if (!this.client) return false;
    const admin = payload.email || process.env.ADMIN_NOTIF_EMAIL || 'info@drove.es';
    const statusEs = this.localizeInvoiceStatus(payload.status);
    const subject = `Factura ${statusEs}${payload.invoiceNumber ? ` #${payload.invoiceNumber}` : ''}`;
    const html = `
      <table cellspacing="0" cellpadding="0" width="100%">
        <tr><td align="center">
          <table width="600" cellspacing="0" cellpadding="20" style="background:#1a1122;border-radius:10px;color:#fff">
            <tr><td>
              <h2 style="color:#6EF7FF;margin:0 0 8px">Factura ${statusEs}</h2>
              ${payload.invoiceNumber ? `<p><strong>N°:</strong> ${payload.invoiceNumber}</p>` : ''}
              ${payload.travelId ? `<p><strong>Transfer:</strong> ${payload.travelId}</p>` : ''}
              ${payload.amount != null ? `<p><strong>Monto:</strong> €${Number(payload.amount || 0).toFixed(2)}</p>` : ''}
              ${payload.clientEmail ? `<p><strong>Cliente:</strong> ${payload.clientEmail}</p>` : ''}
              ${payload.updatedAt ? `<p><strong>Fecha:</strong> ${payload.updatedAt}</p>` : ''}
            </td></tr>
          </table>
        </td></tr>
      </table>`;
    await this.client.emails.send({ from: 'contacto@drove.es', to: admin, subject, html });
    return true;
  }

  private buildQrUrl(usePage: 'withdrawals' | 'delivery', id: string): string {
    const target = this.buildVerificationPath(usePage, id);
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(target)}`;
  }

  private getAdminEmail(): string {
    return process.env.ADMIN_NOTIFICATIONS_EMAIL || 'info@drove.es';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Ensures at most 2 sends occur within any rolling 1s window.
   * Adds a small buffer to avoid server-side rounding differences.
   */
  private async acquireRateLimitSlot(): Promise<void> {
    const now = Date.now();
    this.sendTimestamps = this.sendTimestamps.filter((t) => now - t < 1000);
    if (this.sendTimestamps.length >= 2) {
      const earliest = this.sendTimestamps[0];
      const waitMs = Math.max(0, 1000 - (now - earliest) + 50);
      await this.sleep(waitMs);
      return this.acquireRateLimitSlot();
    }
    this.sendTimestamps.push(Date.now());
  }

  /**
   * Enqueue a task to run after previous sends finish (serialize sends globally).
   */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.sendQueue.then(fn, fn);
    this.sendQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  /**
   * Envía el mismo email a múltiples destinatarios de forma SECUENCIAL.
   * No detiene el envío si uno falla; registra errores y continúa.
   * Devuelve true si al menos un envío fue aceptado.
   */
  private async sendToMultipleSequential(
    recipients: string[],
    base: Omit<ResendSendEmailPayload, 'to'>,
  ): Promise<boolean> {
    let anySuccess = false;
    for (const to of recipients) {
      if (!to) continue;
      const ok = await this.sendEmail({ ...base, to });
      if (ok) anySuccess = true;
    }
    return anySuccess;
  }

  //Correo para asignacion de chofer (email enviar al cliente y personDelivery)
  async sendTransferAssignedEmailClient(travel: Travels | any) {
    const template = this.loadTemplate('transfer‑assigned-client-1');
    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const kmValue = (() => {
      const raw = (travel as any)?.distanceTravel;
      if (typeof raw === 'number') return raw;
      try {
        const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
        const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
        const n = parseFloat(withDot);
        return isNaN(n) ? 0 : n;
      } catch { return 0; }
    })();
    const driverBenefit = (() => {
      const stored = (travel as any)?.driverFee;
      if (typeof stored === 'number' && !isNaN(stored)) return stored;
      try {
        const emp = String(travel?.drover?.employmentType || '').toUpperCase();
        if (emp === 'CONTRACTED') return this.compensation.calcContractedPerTrip(kmValue).driverFee;
        return this.compensation.calcFreelancePerTrip(kmValue).driverFee;
      } catch { return 0; }
    })();

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
      qr_code_url: this.buildQrUrl('withdrawals', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      pickup_date: travel.travelDate,
      pickup_time: travel.travelTime,
      client_name: client.contactInfo.fullName,
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: (() => {
        const raw = (travel as any)?.distanceTravel;
        if (typeof raw === 'number') return raw;
        try {
          const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
          const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
          const n = parseFloat(withDot);
          return isNaN(n) ? 0 : n;
        } catch { return 0; }
      })(), // e.g. 200
      total_with_tax: `$${(travel?.totalPrice ?? 0).toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };
    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'withdrawals',
        true,
        false,
        false,
        false,
        false,
        'delivery',
        1,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step1.pdf`, content: buf },
        ];
      }
    } catch (e) {
      // fallback: send without attachment
    }
    const recipients = Array.from(
      new Set([
        (client?.email as string) || '',
        (travel?.personDelivery?.email as string) || '',
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: payload.subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
  }

  //Correo para asignacion de chofer (email chofer y admin (info@drove.es))
  async sendTransferAssignedEmailDJT(travel: Travels | any) {
    const template = this.loadTemplate('transfer‑assigned-drover-2');
    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const holder = travel.personDelivery || {};
    const kmValue = (() => {
      const raw = (travel as any)?.distanceTravel;
      if (typeof raw === 'number') return raw;
      try {
        const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
        const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
        const n = parseFloat(withDot);
        return isNaN(n) ? 0 : n;
      } catch { return 0; }
    })();
    const driverBenefit = (() => {
      const stored = (travel as any)?.driverFee;
      if (typeof stored === 'number' && !isNaN(stored)) return stored;
      try {
        const emp = String(travel?.drover?.employmentType || '').toUpperCase();
        if (emp === 'CONTRACTED') return this.compensation.calcContractedPerTrip(kmValue).driverFee;
        return this.compensation.calcFreelancePerTrip(kmValue).driverFee;
      } catch { return 0; }
    })();

    const payload: Payload & { driver_benefit?: string } = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
      qr_code_url: this.buildQrUrl('withdrawals', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      pickup_date: travel.travelDate,
      pickup_time: travel.travelTime,
      client_name: client.contactInfo.fullName,
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      holder_name: holder?.fullName || '',
      holder_phone: holder?.phone || '',
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: kmValue, // e.g. 200
      driver_benefit: `${driverBenefit.toFixed(2)} €`,
      total_with_tax: `$${(travel?.totalPrice ?? 0).toLocaleString('es-CL')}`, // retained for client templates
      issue_date: new Date().toLocaleDateString('es-ES'),
    };
    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'withdrawals',
        false,
        false,
        false,
        false,
        false,
        'chofer',
        1,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step1.pdf`, content: buf },
        ];
      }
    } catch (e) {}
    const recipients = Array.from(
      new Set([
        (driver?.email as string) || '',
        this.getAdminEmail(),
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: payload.subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
  }
  //Correo para confirmar recogida de auto (email cliente y personDelivery)
  async sendConfirmationPickupEmailClient(travel: Travels | any) {
    const template = this.loadTemplate('travel-in-route-client-3');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;
    const pickupVerification = travel?.pickupVerification || {};
    // Normalizar firmas: materializar dataURL a URL pública si corresponde
    const clientSigRaw = typeof pickupVerification?.signature === 'string' ? pickupVerification.signature : (travel?.signatureStartClient || '');
    const droverSigRaw = typeof pickupVerification?.droverSignature === 'string' ? pickupVerification.droverSignature : '';
    const clientSignatureUrl = clientSigRaw?.startsWith('data:')
      ? await (async () => {
          const mod = await import('../storage/storage.service');
          const svc = new (mod as any).StorageService(undefined as any, undefined as any, undefined as any, undefined as any);
          return await (svc as any).uploadBase64Image(clientSigRaw, `travel/${travel.id}/signatures`);
        })()
      : clientSigRaw || '';
    const droverSignatureUrl = droverSigRaw?.startsWith('data:')
      ? await (async () => {
          const mod = await import('../storage/storage.service');
          const svc = new (mod as any).StorageService(undefined as any, undefined as any, undefined as any, undefined as any);
          return await (svc as any).uploadBase64Image(droverSigRaw, `travel/${travel.id}/signatures`);
        })()
      : droverSigRaw || '';

    const payload: Payload & { driver_benefit?: string } = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
      qr_code_url: this.buildQrUrl('withdrawals', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      pickup_date: travel.travelDate,
      pickup_time: travel.travelTime,
      client_name: client.contactInfo.fullName,
      client_phone: client?.contactInfo?.phone || '',
      holder_signature_url: clientSignatureUrl,
      driver_signature_url: droverSignatureUrl,
      doc_issue_date: new Date().toLocaleDateString('es-ES'),
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: (() => {
        const raw = (travel as any)?.distanceTravel;
        if (typeof raw === 'number') return raw;
        try {
          const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
          const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
          const n = parseFloat(withDot);
          return isNaN(n) ? 0 : n;
        } catch { return 0; }
      })(), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // retained but not used in drover template
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'delivery',
        true,
        true,
        false,
        false,
        false,
        'chofer',
        2,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step2.pdf`, content: buf },
        ];
      }
    } catch (e) {}
    const recipients = Array.from(
      new Set([
        (client?.email as string) || '',
        (travel?.personDelivery?.email as string) || '',
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: 'Comprobante de inicio de transporte del vehículo',
      html,
      ...(attachments ? { attachments } : {}),
    });
  }
  //Correo para confirmar recogida de auto (email drover y admin (info@drove.es))
  async sendConfirmationPickupEmailDJT(travel: Travels | any) {
    const template = this.loadTemplate('travel-in-route-drover-jt-4');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;
    const receiver = travel.personReceive || {};

    const kmValue2 = (() => {
      const raw = (travel as any)?.distanceTravel;
      if (typeof raw === 'number') return raw;
      try {
        const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
        const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
        const n = parseFloat(withDot);
        return isNaN(n) ? 0 : n;
      } catch { return 0; }
    })();
    const driverBenefit2 = (() => {
      const stored = (travel as any)?.driverFee;
      if (typeof stored === 'number' && !isNaN(stored)) return stored;
      try {
        const emp = String(travel?.drover?.employmentType || '').toUpperCase();
        if (emp === 'CONTRACTED') return this.compensation.calcContractedPerTrip(kmValue2).driverFee;
        return this.compensation.calcFreelancePerTrip(kmValue2).driverFee;
      } catch { return 0; }
    })();

    const payload: Payload & { driver_benefit?: string } = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
      qr_code_url: this.buildQrUrl('withdrawals', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      receiver_name: receiver?.fullName || '',
      receiver_phone: receiver?.phone || '',
      receiver_dni: receiver?.dni || '',
      transport_id: travel.id,
      pickup_date: travel.travelDate,
      pickup_time: travel.travelTime,
      client_name: client.contactInfo.fullName,
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: kmValue2, // e.g. 200
      driver_benefit: `${driverBenefit2.toFixed(2)} €`,
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // retained but not used in drover template
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'delivery',
        false,
        true,
        false,
        false,
        false,
        'reception',
        2,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step2.pdf`, content: buf },
        ];
      }
    } catch (e) {}
    const recipients = Array.from(
      new Set([
        (driver?.email as string) || '',
        this.getAdminEmail(),
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: '¡Vas camino al punto de destino!',
      html,
      ...(attachments ? { attachments } : {}),
    });
  }
  //Correo para llega al destino (email client, admin (info@drove.es), personDelivery, personReceive) (no se envia al drover)
  async sendArrivedEmailDJT(travel: Travels | any) {
    const template = this.loadTemplate('travel-arrived-client-jt-5');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;
    const deliveryVerification = travel?.deliveryVerification || {};

    const kmValue3 = (() => {
      const raw = (travel as any)?.distanceTravel;
      if (typeof raw === 'number') return raw;
      try {
        const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
        const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
        const n = parseFloat(withDot);
        return isNaN(n) ? 0 : n;
      } catch { return 0; }
    })();
    const driverBenefit3 = (() => {
      const stored = (travel as any)?.driverFee;
      if (typeof stored === 'number' && !isNaN(stored)) return stored;
      try {
        const emp = String(travel?.drover?.employmentType || '').toUpperCase();
        if (emp === 'CONTRACTED') return this.compensation.calcContractedPerTrip(kmValue3).driverFee;
        return this.compensation.calcFreelancePerTrip(kmValue3).driverFee;
      } catch { return 0; }
    })();

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
      qr_code_url: this.buildQrUrl('delivery', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      pickup_date: travel.travelDate || '',
      pickup_time: travel.travelTime || '',
      delivery_date: new Date(travel?.updatedAt || Date.now()).toLocaleDateString('es-ES'),
      delivery_time: (() => {
        const time = (deliveryVerification as any)?.time || travel?.timeTravel || travel?.travelTime || '';
        return typeof time === 'string' && time ? time : new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      })(),
      transport_id: travel.id,
      client_name: client.contactInfo.fullName,
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: (() => {
        const raw = (travel as any)?.distanceTravel;
        if (typeof raw === 'number') return raw;
        try {
          const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
          const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
          const n = parseFloat(withDot);
          return isNaN(n) ? 0 : n;
        } catch { return 0; }
      })(), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'delivery',
        true,
        false,
        false,
        false,
        false,
        'chofer',
        3,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step3.pdf`, content: buf },
        ];
      }
    } catch (e) {}
    const recipients = Array.from(
      new Set([
        (client?.email as string) || '',
        this.getAdminEmail(),
        (travel?.personDelivery?.email as string) || '',
        (travel?.personReceive?.email as string) || '',
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: 'DROVER llego a su destino',
      html,
      ...(attachments ? { attachments } : {}),
    });
  }
  //Correo de entrega de vehiculo (cliente admin (info@drove.es), personReceive) X
  async sendConfirmationDeliveryEmailCJT(travel: Travels | any) {
    const template = this.loadTemplate('reception-travel-client-receptor-jt-6');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;
    const receiver = travel.personReceive || {};
    const handover = travel?.deliveryVerification?.handoverDocuments || {};
    const clientSigRaw = typeof handover?.client_signature === 'string' ? handover.client_signature : '';
    const droverSigRaw = typeof handover?.drover_signature === 'string' ? handover.drover_signature : '';
    const clientSignatureUrl = clientSigRaw?.startsWith('data:')
      ? await (async () => {
          const mod = await import('../storage/storage.service');
          const svc = new (mod as any).StorageService(undefined as any, undefined as any, undefined as any, undefined as any);
          return await (svc as any).uploadBase64Image(clientSigRaw, `travel/${travel.id}/signatures`);
        })()
      : clientSigRaw || '';
    const droverSignatureUrl = droverSigRaw?.startsWith('data:')
      ? await (async () => {
          const mod = await import('../storage/storage.service');
          const svc = new (mod as any).StorageService(undefined as any, undefined as any, undefined as any, undefined as any);
          return await (svc as any).uploadBase64Image(droverSigRaw, `travel/${travel.id}/signatures`);
        })()
      : droverSigRaw || '';

    const payload: Payload = {
      to: client.email,
      subject: 'Vehículo entregado',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
    qr_code_url: this.buildQrUrl('delivery', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      delivery_date: new Date(travel?.updatedAt || Date.now()).toLocaleDateString('es-ES'),
      reception_time: (() => {
        const t = (handover as any)?.time || travel?.timeTravel || travel?.travelTime || '';
        return typeof t === 'string' && t ? t : new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      })(),
      transport_id: travel.id,
      pickup_date: travel.travelDate || '',
      pickup_time: travel.travelTime || '',
      client_name: client.contactInfo.fullName,
      receiver_name: receiver?.fullName || '',
      receiver_nif: receiver?.dni || '',
      client_signature_url: clientSignatureUrl,
      driver_signature_url: droverSignatureUrl,
      doc_issue_date: new Date().toLocaleDateString('es-ES'),
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: (() => {
        const raw = (travel as any)?.distanceTravel;
        if (typeof raw === 'number') return raw;
        try {
          const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
          const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
          const n = parseFloat(withDot);
          return isNaN(n) ? 0 : n;
        } catch { return 0; }
      })(), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'delivery',
        false,
        false,
        true,
        true,
        true,
        'delivery',
        4,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step4.pdf`, content: buf },
        ];
      }
    } catch (e) {}
    const recipients = Array.from(
      new Set([
        (client?.email as string) || '',
        this.getAdminEmail(),
        (travel?.personReceive?.email as string) || '',
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: payload.subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
  }
  //Correo de entrega de vehiculo (drover) X
  async sendConfirmationDeliveryDrover(travel: Travels | any) {
    const template = this.loadTemplate('confirmation-delivery-drover-7');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;
    const receiver = travel.personReceive || {};
    const handover = travel?.deliveryVerification?.handoverDocuments || {};
    const clientSigRaw = typeof handover?.client_signature === 'string' ? handover.client_signature : '';
    const droverSigRaw = typeof handover?.drover_signature === 'string' ? handover.drover_signature : '';
    const clientSignatureUrl = clientSigRaw?.startsWith('data:')
      ? await (async () => {
          const mod = await import('../storage/storage.service');
          const svc = new (mod as any).StorageService(undefined as any, undefined as any, undefined as any, undefined as any);
          return await (svc as any).uploadBase64Image(clientSigRaw, `travel/${travel.id}/signatures`);
        })()
      : clientSigRaw || '';
    const droverSignatureUrl = droverSigRaw?.startsWith('data:')
      ? await (async () => {
          const mod = await import('../storage/storage.service');
          const svc = new (mod as any).StorageService(undefined as any, undefined as any, undefined as any, undefined as any);
          return await (svc as any).uploadBase64Image(droverSigRaw, `travel/${travel.id}/signatures`);
        })()
      : droverSigRaw || '';

    const payload: Payload = {
      to: client.email,
      subject: 'Felicidades entregaste el vehículo',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
      qr_code_url: this.buildQrUrl('delivery', travel.id),
      driver_name: driver ? `${driver.contactInfo.fullName}` : 'Por asignar',
      driver_phone: driver ? driver.contactInfo.phone : '',
      delivery_date: new Date(travel?.updatedAt || Date.now()).toLocaleDateString('es-ES'),
      reception_time: (() => {
        const t = (handover as any)?.time || travel?.timeTravel || travel?.travelTime || '';
        return typeof t === 'string' && t ? t : new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      })(),
      transport_id: travel.id,
      pickup_date: travel.travelDate || '',
      pickup_time: travel.travelTime || '',
      client_name: client.contactInfo.fullName,
      receiver_name: receiver?.fullName || '',
      receiver_nif: receiver?.dni || '',
      client_signature_url: clientSignatureUrl,
      driver_signature_url: droverSignatureUrl,
      doc_issue_date: new Date().toLocaleDateString('es-ES'),
      request_id: travel.id,
      vehicle_type: travel.typeVehicle,
      brand: travel.brandVehicle,
      model: travel.modelVehicle,
      year: travel.yearVehicle,
      plate: travel.patentVehicle,
      vin: travel.bastidor,
      pickup_address: {
        street: pickup.street,
        postal_code: pickup.postal_code,
        city: pickup.city,
        region: pickup.region,
        country: pickup.country,
      },
      delivery_address: {
        street: delivery.street,
        postal_code: delivery.postal_code,
        city: delivery.city,
        region: delivery.region,
        country: delivery.country,
      },
      distance: (() => {
        const raw = (travel as any)?.distanceTravel;
        if (typeof raw === 'number') return raw;
        try {
          const s = String(raw || '').replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').replace(/\s+/g, '');
          const withDot = s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, '');
          const n = parseFloat(withDot);
          return isNaN(n) ? 0 : n;
        } catch { return 0; }
      })(), // e.g. 200
      // driver benefit injected via template only for drover template
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // retained but not used in drover template
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    let attachments: any[] | undefined;
    try {
      const pdfUrl = await this.pdfService.generatePDF(
        travel.id,
        'delivery',
        false,
        false,
        true,
        true,
        true,
        'chofer',
        4,
      );
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.buffer();
        attachments = [
          { filename: `transfer_${travel.id}_step4.pdf`, content: buf },
        ];
      }
    } catch (e) {}
    const recipients = Array.from(
      new Set([
        (driver?.email as string) || '',
      ].filter(Boolean)),
    );
    return this.sendToMultipleSequential(recipients, {
      from: 'contacto@drove.es',
      subject: payload.subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
  }
  //Correo para verificar correos.
  async sendEmailToverifyEmail(email: string, Code: string) {
    const template = this.loadTemplate('verificationCode');

    const payload = {
      verification_code: Code,
      expiration_minutes: 10, //tiempo de expiracion
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Código de verificación de email',
      html,
    });
  }
  /**
   * Devuelve `true` si la petición se aceptó, `false` en cualquier error
   * (sin lanzar excepción para no tumbar la app).
   */
  async sendEmail(payload: ResendSendEmailPayload): Promise<boolean> {
    if (!this.client) {
      this.logger.debug('Modo mock – correo NO enviado:', payload);
      return false;
    }

    // Serialize all sends and respect rate limit
    return this.enqueue(async () => {
      await this.acquireRateLimitSlot();

      const maxRetries = 5;
      let delayMs = 600; // start slightly above 500ms
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const { error } = await this.client!.emails.send(payload as any);
          if (!error) return true;

          const msg = (error as any)?.message || '';
          const name = (error as any)?.name || '';
          const status = (error as any)?.statusCode;
          const isRate = status === 429 || /too many requests/i.test(msg) || /rate/i.test(name);
          if (!isRate) {
            this.logger.error(`Resend error: ${msg}`, error as any);
            return false;
          }
          if (attempt === maxRetries) {
            this.logger.error(`Resend rate limit after ${maxRetries + 1} attempts`);
            return false;
          }
          // Backoff with jitter
          const jitter = Math.floor(Math.random() * 200);
          await this.sleep(delayMs + jitter);
          delayMs = Math.min(delayMs * 2, 5000);
        } catch (err: any) {
          const msg = err?.message || '';
          const isRate = /Too many requests/i.test(msg) || err?.statusCode === 429 || err?.name === 'rate_limit_exceeded';
          if (isRate && attempt < maxRetries) {
            const jitter = Math.floor(Math.random() * 200);
            await this.sleep(delayMs + jitter);
            delayMs = Math.min(delayMs * 2, 5000);
            continue;
          }
          this.logger.error('Fallo inesperado enviando correo', err as Error);
          return false;
        }
      }
      return false;
    });
  }
  /**
   * Envía el correo de activación de un nuevo “Jefe de Tráfico”.
   * Usa el sistema de plantillas existente (`loadTemplate`).
   *
   * Nombre de la plantilla:  trafficManagerActivated
   *
   * Variables que la plantilla debe exponer:
   *   - name              → nombre del usuario
   *   - temp_password     → contraseña temporal
   *   - login_url         → enlace de acceso
   *   - expiration_hours  → horas de validez de la contraseña
   X */
  public sendTrafficManagerActivatedEmail = async (
    email: string,
    name: string,
    tempPassword: string,
  ) => {
    const template = this.loadTemplate('activeNewTrafficBoss');

    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const loginUrl = `${baseUrl.replace(/\/$/, '')}/login`;
    const html = template({
      name,
      temp_password: tempPassword,
      login_url: loginUrl,
      expiration_hours: 24,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Tu acceso a DROVE ha sido activado',
      html,
    });
  };

  /**
   * Notifica al equipo admin que un nuevo usuario verificó su correo y está pendiente de aprobación.
   */
  public sendNewUserPendingApprovalEmail = async (
    to: string | string[],
    userEmail: string,
    fullName: string,
    role: string,
    approvalUrl: string,
    logoUrl: string = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
  ) => {
    const year = new Date().getFullYear();
    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#0F0A12; color:#fff; padding:24px;">
        <div style="text-align:center; margin-bottom:16px;">
          <img src="${logoUrl}" alt="DROVE" style="height:40px" />
        </div>
        <h2 style="margin:0 0 12px 0; font-size:20px;">Nuevo usuario pendiente de aprobación</h2>
        <p style="margin:0 0 8px 0; color:#ddd;">Se ha verificado un nuevo registro y requiere revisión:</p>
        <ul style="color:#ddd; line-height:1.6">
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Nombre:</strong> ${fullName || 'Sin nombre'}</li>
          <li><strong>Rol:</strong> ${role}</li>
        </ul>
        <div style="margin:16px 0;">
          <a href="${approvalUrl}" style="display:inline-block; background:#7C3AED; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Abrir panel para aprobar</a>
        </div>
        <p style="margin-top:24px; color:#999; font-size:12px;">© ${year} DROVE</p>
      </div>`;

    if (!this.client) return false;
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to,
      subject: 'Nuevo usuario verificado – pendiente de aprobación',
      html,
    } as any);
  };

  /**
   * Envía el e-mail de “Cuenta aprobada” (usuario estándar).
   *
   * Plantilla:  accountApproved
   * Variables que la plantilla recibe:
   *   - name        → nombre del usuario
   *   - login_url   → enlace para iniciar sesión
   X */
  public sendAccountApprovedEmail = async (
    email: string, // destinatario
    name: string, // nombre a mostrar
    loginUrl?: string, // URL del botón (se puede sobreescribir)
  ) => {
    const template = this.loadTemplate('approvedAccount');

    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const computedLogin = `${baseUrl.replace(/\/$/, '')}/login`;
    const html = template({
      name,
      login_url: loginUrl || computedLogin,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: '¡Tu cuenta en DROVE ha sido aprobada! 🚘',
      html,
    });
  };

  /**
   * Envía el correo de “Cuenta no aprobada”.
   *
   * Plantilla:  accountRejected
   * Variables que la plantilla recibe:
   *   - name             → nombre del usuario
   *   - rejection_reason → motivo del rechazo
   X */
  public sendAccountRejectedEmail = async (
    email: string, // destinatario
    name: string, // nombre a mostrar
    reason: string, // motivo del rechazo
  ) => {
    const template = this.loadTemplate('declinedAprovedAccount');

    const html = template({
      name,
      rejection_reason: reason,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Tu registro en DROVE no ha sido aprobado',
      html,
    });
  };

  /**
   * Envía el correo de “Factura disponible” tras el pago de un traslado.
   *
   * Plantilla:  invoiceAvailable
   * Variables que la plantilla recibe:
   *   - transfer_id     → ID del traslado
   *   - payment_date    → fecha del pago (DD/MM/AAAA)
   *   - amount          → monto (sin símbolo de moneda - el símbolo estará en la plantilla)
   *   - invoice_number  → número de factura
   *   - invoice_url     → URL para visualizar/descargar la factura en PDF
   X */
  public sendInvoiceAvailableEmail = async (
    email: string,
    transferId: string,
    paymentDate: string,
    amount: string, // ya formateado (ej. "150,00")
    invoiceNumber: string,
    invoiceUrl: string,
  ) => {
    const template = this.loadTemplate('invoiceAvailable');

    const html = template({
      transfer_id: transferId,
      payment_date: paymentDate,
      amount,
      invoice_number: invoiceNumber,
      invoice_url: invoiceUrl,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Tu factura ya está disponible',
      html,
    });
  };

  /**
   * Envía el correo de “Nuevo DROVER asignado”.
   *
   * Plantilla:  driverAssigned
   * Variables que la plantilla recibe:
   *   - logo_url        → URL del logotipo
   *   - vehicle         → descripción del vehículo
   *   - transfer_date   → fecha del traslado
   *   - origin          → origen
   *   - destination     → destino
   *   - driver_name     → nombre del drover asignado
   *   - transfer_url    → enlace al detalle del traslado
   *   - year            → año actual (pie de página)
   X */
  public sendDriverAssignedEmail = async (
    email: string,
    vehicle: string,
    transferDate: string,
    origin: string,
    destination: string,
    driverName: string,
    transferUrl: string,
    logoUrl = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
    year: number = new Date().getFullYear(),
  ) => {
    const template = this.loadTemplate('newDrover-reassigned');

    const html = template({
      logo_url: logoUrl,
      vehicle,
      transfer_date: transferDate,
      origin,
      destination,
      driver_name: driverName,
      transfer_url: this.buildFrontUrl(transferUrl),
      year,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Nuevo DROVER asignado a tu traslado',
      html,
    });
  };

  /**
   * Envía el correo de “Nueva reseña recibida” al DROVER.
   *
   * Plantilla:  reviewReceived
   * Variables que la plantilla recibe:
   *   - name            → nombre del drover
   *   - transfer_date   → fecha del traslado
   *   - vehicle         → marca y modelo del vehículo
   *   - origin          → punto de origen
   *   - destination     → punto de destino
   *   - client_name     → nombre del cliente
   *   - rating          → calificación numérica (1-5)
   *   - comment         → comentario escrito por el cliente
   X */
  public sendReviewReceivedEmail = async (
    email: string, // destinatario
    name: string,
    transferDate: string,
    vehicle: string,
    origin: string,
    destination: string,
    clientName: string,
    rating: number,
    comment: string,
  ) => {
    const template = this.loadTemplate('newReview');

    const html = template({
      name,
      transfer_date: transferDate,
      vehicle,
      origin,
      destination,
      client_name: clientName,
      rating,
      comment,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: '¡Has recibido una nueva reseña en DROVE!',
      html,
    });
  };

  /**
   * Envía el correo “Solicitud de traslado registrada” al cliente.
   *
   * Plantilla:  transferRequestCreated
   * Variables que la plantilla recibe:
   *   - name            → nombre del cliente
   *   - vehicle         → marca, modelo y patente
   *   - requested_date  → fecha solicitada para el traslado
   *   - origin          → punto de origen
   *   - destination     → punto de destino
   *   - transfer_url    → enlace al detalle del traslado
   X */
  public sendTransferRequestCreatedEmail = async (
    email: string,
    name: string,
    vehicle: string,
    requestedDate: string,
    origin: string,
    destination: string,
    transferUrl: string,
  ) => {
    const template = this.loadTemplate('newTransfer');

    const html = template({
      name,
      vehicle,
      requested_date: requestedDate,
      origin,
      destination,
      transfer_url: this.buildFrontUrl(transferUrl),
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Tu solicitud de traslado ha sido registrada',
      html,
    });
  };

  /**
   * Envía notificación al administrador cuando se crea un traslado
   */
  public sendTransferCreatedAdminEmail = async (
    adminEmail: string,
    clientName: string,
    vehicle: string,
    requestedDate: string,
    origin: string,
    destination: string,
    transferId: string,
  ) => {
    const template = this.loadTemplate('newTransfer');
    const html = template({
      name: clientName,
      vehicle,
      requested_date: requestedDate,
      origin,
      destination,
      transfer_url: this.buildFrontUrl(`/admin/traslados/${transferId}`),
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: adminEmail,
      subject: 'Nuevo traslado creado',
      html,
    });
  };

  /**
   * Envía el correo de “Pago recibido”.
   *
   * Plantilla:  paymentReceived
   * Variables que la plantilla recibe:
   *   - logo_url        → URL del logotipo (opcional, por defecto el logo oficial)
   *   - payment_date    → fecha del pago (DD/MM/AAAA)
   *   - amount          → monto pagado (sin símbolo)
   *   - payment_method  → método de pago usado
   *   - transfer_id     → ID del traslado asociado
   *   - transfer_url    → enlace para ver el traslado
   X */
  public sendPaymentReceivedEmail = async (
    email: string,
    paymentDate: string,
    amount: string, // ya formateado, p. ej. "250,00"
    paymentMethod: string,
    transferId: string,
    transferUrl: string,
    logoUrl = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
  ) => {
    const template = this.loadTemplate('paymentSuccess');

    const html = template({
      logo_url: logoUrl,
      payment_date: paymentDate,
      amount,
      payment_method: paymentMethod,
      transfer_id: transferId,
      transfer_url: this.buildFrontUrl(transferUrl),
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: '¡Pago recibido!',
      html,
    });
  };

  /**
   * Envía el correo “Solicitud de evaluación” al cliente
   * después de que su traslado fue completado.
   *
   * Plantilla:  reviewRequest
   * Variables que la plantilla recibe:
   *   - name            → nombre del cliente
   *   - transfer_date   → fecha del traslado
   *   - vehicle         → marca y modelo
   *   - origin          → lugar de origen
   *   - destination     → lugar de destino
   *   - review_link     → URL para dejar la reseña
   X */
  public sendReviewRequestEmail = async (
    email: string,
    name: string,
    transferDate: string,
    vehicle: string,
    origin: string,
    destination: string,
    reviewLink: string,
  ) => {
    const template = this.loadTemplate('questionReview');

    // Asegurar URL absoluta y clickeable
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const normalizedLink = (() => {
      if (!reviewLink) return `${baseUrl.replace(/\/$/, '')}/resena`;
      if (/^https?:\/\//i.test(reviewLink)) return reviewLink;
      const sep = reviewLink.startsWith('/') ? '' : '/';
      return `${baseUrl.replace(/\/$/, '')}${sep}${reviewLink}`;
    })();

    const html = template({
      name,
      transfer_date: transferDate,
      vehicle,
      origin,
      destination,
      review_link: normalizedLink,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: '¿Cómo fue tu experiencia?',
      html,
    });
  };

  /**
   * Envía el correo “Recordatorio de traslado” al drover.
   *
   * Plantilla:  transferReminder
   * Variables que la plantilla recibe:
   *   - name           → nombre del drover
   *   - transfer_date  → fecha del traslado
   *   - transfer_time  → hora estimada
   *   - origin         → punto de origen
   *   - destination    → destino
   *   - transfer_url   → enlace para ver el traslado
   */
  public sendTransferReminderEmail = async (
    email: string,
    name: string,
    transferDate: string,
    transferTime: string,
    origin: string,
    destination: string,
    transferUrl: string,
  ) => {
    const template = this.loadTemplate('reminderTransfer');

    const html = template({
      name,
      transfer_date: transferDate,
      transfer_time: transferTime,
      origin,
      destination,
      transfer_url: this.buildFrontUrl(transferUrl),
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Recordatorio de traslado programado',
      html,
    });
  };

  /**
   * Envía el correo de “Restablecer contraseña”.
   *
   * Plantilla:  passwordReset
   * Variables que la plantilla recibe:
   *   - name       → nombre del usuario
   *   - reset_link → enlace para crear la nueva contraseña
   */
  //TODO: Hacer flujo
  public sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetLink: string,
  ) => {
    const template = this.loadTemplate('resetPassword');
    console.log('nombre usado', name);
    const html = template({
      name,
      reset_link: resetLink,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Restablecer contraseña',
      html,
    });
  };

  /**
   * Envía el correo “Traslado reprogramado”.
   *
   * Plantilla:  transferRescheduled
   * Variables que la plantilla recibe:
   *   - name          → nombre del destinatario
   *   - new_date      → nueva fecha (DD/MM/AAAA)
   *   - new_time      → nuevo horario estimado
   *   - origin        → punto de origen
   *   - destination   → punto de destino
   *   - reason        → motivo de la reprogramación
   *   - transfer_url  → enlace al detalle del traslado
   X */
  public sendTransferRescheduledEmail = async (
    email: string,
    name: string,
    newDate: string,
    newTime: string,
    origin: string,
    destination: string,
    reason: string,
    transferUrl: string,
  ) => {
    const template = this.loadTemplate('scheduledTransfer');

    const html = template({
      name,
      new_date: newDate,
      new_time: newTime,
      origin,
      destination,
      reason,
      transfer_url: this.buildFrontUrl(transferUrl),
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Tu traslado ha sido reprogramado',
      html,
    });
  };

  /**
   * Envía el correo “Pago recibido – Pendiente de facturación” al equipo admin.
   *
   * Plantilla:  transferPendingInvoice
   * Variables que la plantilla recibe:
   *   - logo_url          → URL del logotipo (opcional)
   *   - client_name       → nombre del cliente
   *   - vehicle           → marca, modelo y patente
   *   - origin            → punto de origen
   *   - destination       → punto de destino
   *   - transfer_date     → fecha solicitada
   *   - admin_transfer_url→ enlace al traslado en el panel de administración
   X */
  public sendTransferPendingInvoiceEmail = async (
    email: string, // destinatario (admin)
    clientName: string,
    vehicle: string,
    origin: string,
    destination: string,
    transferDate: string,
    adminTransferUrl: string,
    logoUrl: string = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
  ) => {
    const template = this.loadTemplate('transfer-create-pending-invoice');

    const html = template({
      logo_url: logoUrl,
      client_name: clientName,
      vehicle,
      origin,
      destination,
      transfer_date: transferDate,
      admin_transfer_url: adminTransferUrl,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Pago recibido – Pendiente de facturación',
      html,
    });
  };

  /**
   * Envía el correo “Traslado listo para ser asignado” al equipo de operaciones.
   *
   * Plantilla:  transferReadyToAssign
   * Variables que la plantilla recibe:
   *   - logo_url          → URL del logotipo (opcional, se usa el oficial por defecto)
   *   - client_name       → nombre del cliente
   *   - vehicle           → marca, modelo y patente
   *   - origin            → punto de origen
   *   - destination       → punto de destino
   *   - transfer_date     → fecha solicitada
   *   - admin_transfer_url→ enlace al traslado en el panel de administración
   X */
  public sendTransferReadyToAssignEmail = async (
    email: string, // destinatario (operaciones/admin)
    clientName: string,
    vehicle: string,
    origin: string,
    destination: string,
    transferDate: string,
    adminTransferUrl: string,
    logoUrl: string = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
  ) => {
    const template = this.loadTemplate('transferAvailableForAssigned');

    const html = template({
      logo_url: logoUrl,
      client_name: clientName,
      vehicle,
      origin,
      destination,
      transfer_date: transferDate,
      admin_transfer_url: adminTransferUrl,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Traslado listo para ser asignado',
      html,
    });
  };

  /**
   * Envía el correo “Traslado cancelado”.
   *
   * Plantilla:  transferCancelled
   * Variables que la plantilla recibe:
   *   - name          → nombre del destinatario
   *   - transfer_date → fecha original del traslado
   *   - origin        → punto de origen
   *   - destination   → punto de destino
   *   - reason        → motivo de la cancelación
   X */
  public sendTransferCancelledEmail = async (
    email: string,
    name: string,
    transferDate: string,
    origin: string,
    destination: string,
    reason: string,
  ) => {
    const template = this.loadTemplate('transferCancelled');

    const html = template({
      name,
      transfer_date: transferDate,
      origin,
      destination,
      reason,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Traslado cancelado',
      html,
    });
  };

  /**
   * Envía el correo “Traslado pendiente de facturación”.
   * Se usa cuando el pago por transferencia fue confirmado,
   * pero aún falta registrar la factura.
   *
   * Plantilla:  transferPendingBilling
   * Variables que la plantilla recibe:
   *   - logo_url           → URL del logotipo (opcional, se usa el oficial por defecto)
   *   - client_name        → nombre del cliente
   *   - vehicle            → marca, modelo y patente
   *   - origin             → punto de origen
   *   - destination        → punto de destino
   *   - transfer_date      → fecha solicitada
   *   - admin_transfer_url → enlace al traslado en el panel de administración
   */
  public sendTransferPendingBillingEmail = async (
    email: string, // destinatario (equipo contable/admin)
    clientName: string,
    vehicle: string,
    origin: string,
    destination: string,
    transferDate: string,
    adminTransferUrl: string,
    logoUrl: string = 'https://console-production-7856.up.railway.app/api/v1/buckets/drover/objects/download?preview=true&prefix=9.png&version_id=null',
  ) => {
    const template = this.loadTemplate('transferPendingInvoiceForTransfer');

    const html = template({
      logo_url: logoUrl,
      client_name: clientName,
      vehicle,
      origin,
      destination,
      transfer_date: transferDate,
      admin_transfer_url: adminTransferUrl,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Traslado pendiente de facturación',
      html,
    });
  };

  /**
   * Envía el correo “Verifica tu correo electrónico”.
   *
   * Plantilla:  emailVerification
   * Variables que la plantilla recibe:
   *   - name               → nombre del usuario
   *   - verification_link  → URL para verificar la cuenta
   */
  //TODO: Definir 1 solo flujo ya existe la verificacion por codigo.
  public sendEmailVerificationEmail = async (
    email: string,
    name: string,
    verificationLink: string,
  ) => {
    const template = this.loadTemplate('verificationNewEmail');

    // Soporta ambas convenciones de variables usadas en plantillas
    const html = template({
      name,
      verification_link: verificationLink,
      // Compat con plantilla actual (mayúsculas y nombres en ES)
      LINK_VERIFICACION: verificationLink,
      Nombre: name,
    });

    if (!this.client) return false;

    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: email,
      subject: 'Verifica tu correo electrónico',
      html,
    });
  };
}
