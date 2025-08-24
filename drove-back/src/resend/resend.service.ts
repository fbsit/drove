// src/resend/resend.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Travels } from './../travels/entities/travel.entity';

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

  constructor(private readonly config: ConfigService) {
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

  //Correo para asignacion de chofer (email cliente y person delivery) X
  async sendTransferAssignedEmailClient(travel: Travels | any) {
    const template = this.loadTemplate('transfer‑assigned-client-1');
    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${(travel?.totalPrice ?? 0).toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };
    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: payload.to,
      subject: payload.subject,
      html,
    });
  }
  //Correo para asignacion de chofer (email chofer jt) X
  async sendTransferAssignedEmailDJT(travel: Travels | any) {
    const template = this.loadTemplate('transfer‑assigned-drover-2');
    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${(travel?.totalPrice ?? 0).toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };
    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: payload.to,
      subject: payload.subject,
      html,
    });
  }
  //Correo para confirmar recogida de auto (email cliente) X
  async sendConfirmationPickupEmailClient(travel: Travels | any) {
    const template = this.loadTemplate('travel-in-route-client-3');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: client.email,
      subject: 'DROVER se dirigue a su destino',
      html,
    });
  }
  //Correo para confirmar recogida de auto (email drover jt) X
  async sendConfirmationPickupEmailDJT(travel: Travels | any) {
    const template = this.loadTemplate('travel-in-route-drover-jt-4');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: client.email,
      subject: 'DROVER se dirigue a su destino',
      html,
    });
  }
  //Correo para llega al destino (email client jt) (no se envia al drover) X
  async sendArrivedEmailDJT(travel: Travels | any) {
    const template = this.loadTemplate('travel-arrived-client-jt-5');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Traslado asignado a un Drover',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: client.email,
      subject: 'DROVER llego a su destino',
      html,
    });
  }
  //Correo de entrega de vehiculo (cliente jt receptor) X
  async sendConfirmationDeliveryEmailCJT(travel: Travels | any) {
    const template = this.loadTemplate('reception-travel-client-receptor-jt-6');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Vehículo entregado',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: client.email,
      subject: payload.subject,
      html,
    });
  }
  //Correo de entrega de vehiculo (cliente jt receptor) X
  async sendConfirmationDeliveryDrover(travel: Travels | any) {
    const template = this.loadTemplate('confirmation-delivery-drover-7');

    const driver = travel.drover;
    const client = travel.client;
    const pickup = travel.startAddress;
    const delivery = travel.endAddress;

    const payload: Payload = {
      to: client.email,
      subject: 'Felicidades entregaste el vehículo',
      preheader: 'Tu vehículo pronto será recogido.',
      logo_url: 'https://drove.com/logo.png',
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${travel.id}`,
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
      distance: Number(travel.distanceTravel), // e.g. 200
      total_with_tax: `$${travel.totalPrice.toLocaleString('es-CL')}`, // e.g. '$337,47'
      issue_date: new Date().toLocaleDateString('es-ES'),
    };

    const html = template(payload);
    if (!this.client) {
      return false;
    }
    return this.client.emails.send({
      from: 'contacto@drove.es',
      to: client.email,
      subject: payload.subject,
      html,
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
      this.logger.debug('Modo mock – correo NO enviado:', payload);
      return false;
    }

    try {
      const { error } = await this.client.emails.send(payload as any);

      if (error) {
        this.logger.error(`Resend error: ${error.message}`, error);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error('Fallo inesperado enviando correo', err as Error);
      return false;
    }
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

    const html = template({
      name,
      temp_password: tempPassword,
      login_url: 'https://drove.app/login',
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
    loginUrl = 'https://drove.app/login', // URL del botón (se puede sobreescribir)
  ) => {
    const template = this.loadTemplate('approvedAccount');

    const html = template({
      name,
      login_url: loginUrl,
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
    logoUrl = 'https://cdn.drove.es/logo-white.png',
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
      transfer_url: transferUrl,
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
      transfer_url: transferUrl,
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
    logoUrl = 'https://cdn.drove.es/logo-white.png',
  ) => {
    const template = this.loadTemplate('paymentSuccess');

    const html = template({
      logo_url: logoUrl,
      payment_date: paymentDate,
      amount,
      payment_method: paymentMethod,
      transfer_id: transferId,
      transfer_url: transferUrl,
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

    const html = template({
      name,
      transfer_date: transferDate,
      vehicle,
      origin,
      destination,
      review_link: reviewLink,
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
      transfer_url: transferUrl,
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
      transfer_url: transferUrl,
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
    logoUrl: string = 'https://cdn.drove.es/logo-white.png',
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
    logoUrl: string = 'https://cdn.drove.es/logo-white.png',
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
    logoUrl: string = 'https://cdn.drove.es/logo-white.png',
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
