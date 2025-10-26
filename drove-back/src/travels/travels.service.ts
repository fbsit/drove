import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Travels, TransferStatus } from './entities/travel.entity';
import { Payment, PaymentStatus } from '../payment/entities/payment.entity';
import {
  CreateTravelDto,
  UpdateTravelDto,
  UpdateTravelStatusDto,
  PickupVerificationDto,
  DeliveryVerificationDto,
  PersonDto,
  PendingViewsDto,
} from './dto/create-travel.dto';
import { InvoicesService } from '../invoices/invoices.service';
import {
  CreateInvoiceDto,
  InvoiceStatus,
  PaymentMethod,
  LineItemDto,
} from '../invoices/dto/create-invoice.dto';
import { StripeService } from '../payment/stripe.service';
import { ResendService } from '../resend/resend.service';
import { FinishTravelDto } from './../travels/dto/finish-travel.dto';
import { TravelOffer, OfferStatus } from './entities/travel-offer.entity';
import { TravelsGateway } from './travel.gateway';
import { DataSource } from 'typeorm';
import { forwardRef, Inject } from '@nestjs/common';
import { User, UserRole, DroverEmploymentType } from '../user/entities/user.entity';
import { CompensationService, parseKmFromDistance } from '../rates/compensation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RoutesService } from '../routes/routes.service';

interface RescheduleRecord {
  previousDate: string | null;
  previousTime: string | null;
  newDate: string;
  newTime: string;
  changedAt: Date;
  changedBy: string | null;
}

export class RescheduleTravelDto {
  travelDate: string; // “YYYY-MM-DD”
  travelTime: string; // “HH:mm”
}

@Injectable()
export class TravelsService {
  constructor(
    @InjectRepository(Travels)
    private readonly travelsRepo: Repository<Travels>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly invoiceService: InvoicesService,
    private readonly stripeService: StripeService,
    private readonly resend: ResendService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => TravelsGateway))
    private readonly gateway: TravelsGateway,
    private readonly notifications?: NotificationsService,
    private readonly compensation?: CompensationService,
    private readonly routesService?: RoutesService,
  ) {}

  private readonly defaultRelations = [
    'payments',
    'client',
    'drover',
    'invoice',
  ];

  /**
   * Construye una Date local a partir de travelDate (YYYY-MM-DD) y travelTime (HH:mm)
   */
  private buildLocalDateTime(dateStr?: string | null, timeStr?: string | null): Date | null {
    try {
      if (!dateStr) return null;
      const [y, m, d] = String(dateStr).split('-').map((v) => Number(v));
      const [hh = 0, mm = 0] = String(timeStr || '00:00').split(':').map((v) => Number(v));
      if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return null;
      const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
      return isNaN(dt.getTime()) ? null : dt;
    } catch {
      return null;
    }
  }

  private mapRawToDto(raw: any): CreateTravelDto {
    console.log('raw', raw);
    // mapeo de la persona que entrega
    const sender: PersonDto = {
      fullName: raw.senderDetails.fullName,
      dni: raw.senderDetails.dni,
      email: raw.senderDetails.email,
      phone: raw.senderDetails.phone,
    };
    // mapeo de la persona que recibe
    const receiver: PersonDto = {
      fullName: raw.receiverDetails.fullName,
      dni: raw.receiverDetails.dni,
      email: raw.receiverDetails.email,
      phone: raw.receiverDetails.phone,
    };
    // vistas pendientes por defecto (ajusta si las recibes del cliente)
    const pending: PendingViewsDto = {
      client: true,
      driver: false,
      trafficManager: false,
    };

    const initialSignature =
      raw.signatureStartClient ||
      raw.signature ||
      raw?.pickupDetails?.signature ||
      raw?.senderDetails?.signature ||
      '';

    const dto: CreateTravelDto = {
      // — vehículo —
      bastidor: raw.vehicleDetails.vin,
      typeVehicle: raw.vehicleDetails.type,
      brandVehicle: raw.vehicleDetails.brand,
      modelVehicle: raw.vehicleDetails.model,
      yearVehicle: raw.vehicleDetails.year,
      patentVehicle: raw.vehicleDetails.licensePlate,

      // — ruta & tiempo —
      startAddress: raw.pickupDetails.originAddress,
      endAddress: raw.pickupDetails.destinationAddress,
      travelDate: raw.pickupDetails.pickupDate,
      travelTime: raw.pickupDetails.pickupTime,
      distanceTravel: String(raw.transferDetails.distance),
      timeTravel: String(raw.duration ?? raw.timeTravel ?? ''),
      totalPrice: Number(raw.transferDetails.totalPrice),
      priceRoute: String(raw.transferDetails.totalPrice),
      routePolyline: raw.routePolyline || '',

      // — personas —
      personDelivery: sender,
      personReceive: receiver,

      // — firma, cliente y estado —
      signatureStartClient: initialSignature,
      idClient: raw.clientId,
      status: raw.status,
      paymentMethod: raw.paymentMethod,
      // — pendientes & opcionales —
      pendingViews: pending,
      orderId: raw.orderId, // si viene
    } as any;
    return dto;
  }

  private makeInvoiceDto(travel: Travels): CreateInvoiceDto {
    console.log('travel', travel);
    const invoiceDto: CreateInvoiceDto = {
      customerId: travel?.idClient,
      travelId: travel.id,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: undefined, // o calcula tu vencimiento
      status: InvoiceStatus.SENT,
      paymentMethod:
        travel.paymentMethod === 'card'
          ? PaymentMethod.STRIPE
          : PaymentMethod.TRANSFER,
      currency: 'EUR', // o lo que corresponda
      totalAmount: travel.totalPrice! || 0,
      lineItems: [
        // ejemplo: un ítem “Traslado” con precio total
        {
          description: `Traslado ${travel.startAddress} → ${travel.endAddress}`,
          quantity: 1,
          unitPrice: travel.totalPrice!,
        } as LineItemDto,
      ],
      payments: undefined,
    };
    return invoiceDto;
  }

  async create(
    dto: CreateTravelDto,
    user: {
      sub: string;
      email: string;
      name: string;
      iat: number;
      exp: number;
    },
  ): Promise<Travels & { url?: string | null }> {
    const clientId = (user as any)?.sub || (user as any)?.id;
    const payload = {
      ...dto,
      clientId,
    };
    if (!payload.clientId) {
      throw new BadRequestException('Usuario no autenticado: clientId ausente');
    }
    const travel = this.travelsRepo.create(this.mapRawToDto(payload));
    if (travel.paymentMethod === 'card') {
      travel.status = TransferStatus.PENDINGPAID;
    } else {
      travel.status = TransferStatus.CREATED;
    }
    // Calcular distancia/tiempo reales con Google Distance Matrix cuando haya coordenadas
    try {
      const o = travel.startAddress as any;
      const d = travel.endAddress as any;
      const oLat = Number(o?.lat), oLng = Number(o?.lng), dLat = Number(d?.lat), dLng = Number(d?.lng);
      if (isFinite(oLat) && isFinite(oLng) && isFinite(dLat) && isFinite(dLng) && this.routesService) {
        const res: any = await this.routesService.getDistance({ originLat: oLat, originLng: oLng, destinationLat: dLat, destinationLng: dLng });
        if (res?.distance) {
          travel.distanceTravel = String(res.distance); // p.ej. "31 km"
        }
        if (res?.duration) {
          travel.timeTravel = String(res.duration); // p.ej. "39 min"
        }
      }
    } catch {}

    // Intentar precomputar driverFee si ya hay drover asignado al crear (poco común)
    try {
      if (travel.droverId) {
        const drover = await this.userRepo.findOne({ where: { id: travel.droverId } });
        const km = parseKmFromDistance(travel.distanceTravel);
        if (drover && typeof km === 'number' && km > 0 && this.compensation) {
          const type = String(drover.employmentType || '').toUpperCase();
          const preview = type === 'FREELANCE'
            ? this.compensation.calcFreelancePerTrip(km)
            : this.compensation.calcContractedPerTrip(km);
          travel.driverFee = preview?.driverFee ?? null;
          travel.driverFeeMeta = preview ? { ...preview } : null;
        } else {
          travel.driverFee = null;
          travel.driverFeeMeta = null;
        }
      }
    } catch {}
    const savedTravel = await this.travelsRepo.save<Travels>(travel);
    const invoiceDto = this.makeInvoiceDto(savedTravel);
    const newInvoice = await this.invoiceService.create(invoiceDto);
    let checkoutUrl: string | null = null;
    if (savedTravel.paymentMethod === 'card') {
      const payment = this.paymentRepo.create({
        amount: savedTravel.totalPrice!,
        status: PaymentStatus.PENDING,
        currency: 'EUR',
        paymentIntentId: '',
        travel: savedTravel,
      });
      const frontendBase = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
      const base = frontendBase.replace(/\/$/, '');
      checkoutUrl = await this.stripeService.createCheckoutSession({
        transferId: savedTravel.id,
        amountEUR: savedTravel.totalPrice!,
        successUrl: `${base}/paymentSuccess?travel=${savedTravel.id}`,
        cancelUrl: `${base}/paymentCancel?travel=${savedTravel.id}`,
      });
      payment.paymentIntentId = checkoutUrl ?? 'mock_intent';
      await this.paymentRepo.save(payment);
      newInvoice.payments = [
        {
          method: PaymentMethod.STRIPE,
          stripePaymentId: payment.paymentIntentId,
          amount: payment.amount,
          paidAt: new Date().toISOString(),
        },
      ];
      await this.invoiceService.update(newInvoice.id, {
        payments: newInvoice.payments,
      } as any);
    } else if (savedTravel.paymentMethod === 'transfer') {
      const payment = this.paymentRepo.create({
        amount: savedTravel.totalPrice!,
        status: PaymentStatus.PENDING,
        currency: 'EUR',
        paymentIntentId: '',
        travel: savedTravel,
      });
      await this.paymentRepo.save(payment);
      newInvoice.payments = [
        {
          method: PaymentMethod.TRANSFER,
          amount: payment.amount,
          paidAt: new Date().toISOString(),
        },
      ];
      await this.invoiceService.update(newInvoice.id, {
        payments: newInvoice.payments,
      } as any);
    }
    savedTravel.orderId = String(newInvoice.id);
    await this.travelsRepo.save(savedTravel);
    const travelInfo = await this.findOne(savedTravel.id);
    const userDetails = await this.userRepo.findOne({
      where: { id: user.sub },
    });
    const frontendBase = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const url = `${frontendBase.replace(/\/$/, '')}/cliente/traslados/${travelInfo.id}`;
    
    // Enviar correo al cliente confirmando la solicitud de traslado
    try {
      await this.resend.sendTransferRequestCreatedEmail(
        userDetails?.email || '',
        userDetails?.contactInfo?.fullName || '',
        `${travel.brandVehicle} ${travel.modelVehicle} - ${travel.patentVehicle}`,
        travel.travelDate || new Date().toLocaleDateString('es-ES'),
        travel.startAddress.city,
        travel.endAddress.city,
        url || '',
      );
    } catch (emailError) {
      // Log del error pero no interrumpir la creación del viaje
      console.error('Error enviando correo de confirmación al cliente:', emailError);
    }

    // Enviar correo a administrador informando de nuevo traslado
    try {
      // Compatibilidad con ambas variables de entorno posibles
      const adminEmail = process.env.ADMIN_NOTIFICATIONS_EMAIL || process.env.ADMIN_NOTIF_EMAIL || 'info@drove.es';
      await this.resend.sendTransferCreatedAdminEmail(
        adminEmail,
        userDetails?.contactInfo?.fullName || 'Cliente',
        `${travel.brandVehicle} ${travel.modelVehicle} - ${travel.patentVehicle}`,
        travel.travelDate || new Date().toLocaleDateString('es-ES'),
        travel.startAddress.city,
        travel.endAddress.city,
        travelInfo.id,
      );
    } catch {}

    // Notificación para admins: nuevo viaje creado
    try {
      const notif = await this.notifications?.create({
        title: 'Nuevo viaje creado',
        message: `Viaje #${travelInfo.id} ${travel.startAddress?.city} → ${travel.endAddress?.city}`,
        roleTarget: UserRole.ADMIN,
        category: 'TRAVEL_CREATED',
        entityType: 'TRAVEL',
        entityId: travelInfo.id,
        read: false,
        userId: null,
        data: {
          clientId: user.sub,
          startCity: travel.startAddress?.city,
          endCity: travel.endAddress?.city,
        },
      });
      notif;
    } catch {}

    // Notificación para cliente: confirmación de solicitud registrada
    try {
      await this.notifications?.create({
        title: 'Solicitud de traslado registrada',
        message: `Hemos recibido tu solicitud ${travelInfo.id}`,
        roleTarget: UserRole.CLIENT,
        category: 'TRAVEL_CREATED',
        entityType: 'TRAVEL',
        entityId: travelInfo.id,
        read: false,
        userId: user.sub,
        data: {
          startCity: travel.startAddress?.city,
          endCity: travel.endAddress?.city,
        },
      });
    } catch {}
    return { ...travelInfo, url: checkoutUrl };
  }

  async findAll(): Promise<Travels[]> {
    return this.travelsRepo.find({ relations: this.defaultRelations });
  }

  async findOne(id: string): Promise<Travels> {
    const travel = await this.travelsRepo.findOne({
      where: { id } as FindOptionsWhere<Travels>,
      relations: this.defaultRelations,
    });
    if (!travel) throw new NotFoundException(`Travel ${id} not found`);
    return travel;
  }

  async update(id: string, dto: UpdateTravelDto): Promise<Travels> {
    const travel = await this.findOne(id);
    if ((dto as any).droverId) {
      travel.droverId = (dto as any).droverId;
    }
    Object.assign(travel, dto);
    const saved = await this.travelsRepo.save(travel);
    // devolver con relaciones para que droverId esté presente en respuesta del test
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const travel = await this.findOne(id);
    await this.travelsRepo.remove(travel);
  }

  async reschedule(
    id: string,
    { travelDate, travelTime }: RescheduleTravelDto,
    user: { sub: string },
  ): Promise<Travels> {
    const travel = await this.findOne(id);

    // 1) reglas básicas
    if (
      [TransferStatus.DELIVERED, TransferStatus.CANCELLED].includes(
        travel.status,
      )
    ) {
      throw new BadRequestException(
        'No se puede reagendar un viaje entregado o cancelado',
      );
    }

    // 2) registrar la reprogramación
    const history: RescheduleRecord[] = travel.rescheduleHistory ?? [];
    history.push({
      previousDate: travel.travelDate ?? null,
      previousTime: travel.travelTime ?? null,
      newDate: travelDate,
      newTime: travelTime,
      changedAt: new Date(),
      changedBy: user?.sub ?? null,
    });

    // 3) aplicar la nueva fecha/hora
    travel.travelDate = travelDate;
    travel.travelTime = travelTime;
    travel.rescheduleHistory = history; // ← ahora sí existe
    const userDetails = await this.userRepo.findOne({
      where: { id: travel.idClient },
    });
    const frontendBase = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const url = `${frontendBase.replace(/\/$/, '')}/cliente/traslados/${travel.id}`;
    await this.resend.sendTransferRescheduledEmail(
      userDetails?.email || '',
      userDetails?.contactInfo?.fullName || '',
      new Date().toISOString(),
      new Date().toLocaleDateString('es-ES'),
      travel.startAddress.city,
      travel.endAddress.city,
      '',
      url || '',
    );
    // 4) guardar y devolver
    return this.travelsRepo.save(travel);
  }

  async sendOffer(travelId: string, droverIds: string[]) {
    const travel = await this.findOne(travelId);
    if (travel.status !== TransferStatus.CREATED)
      throw new BadRequestException('Travel already assigned');

    // upsert pending offers
    const repo = this.dataSource.getRepository(TravelOffer);
    await Promise.all(
      droverIds.map((dId) =>
        repo.save({ travel: { id: travelId }, drover: { id: dId } }),
      ),
    );

    // emit socket event
    this.gateway.emitOffer(travelId, droverIds);
  }

  async handleDroverResponse(
    droverId: string,
    travelId: string,
    accept: boolean,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const offerRepo = manager.getRepository(TravelOffer);
      const travelRepo = manager.getRepository(Travels);

      // bloqueo para evitar “race condition”
      const travel = await travelRepo.findOne({
        where: { id: travelId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!travel) throw new NotFoundException('Travel not found');

      const offer = await offerRepo.findOne({
        where: { travel: { id: travelId }, drover: { id: droverId } },
      });
      if (!offer || offer.status !== OfferStatus.PENDING)
        throw new BadRequestException('No pending offer for this drover');

      // si otro conductor ya tomó el viaje
      if (travel.droverId) {
        offer.status = OfferStatus.DECLINED;
        offer.respondedAt = new Date();
        await offerRepo.save(offer);
        return { accepted: false, reason: 'already_assigned' };
      }

      // rechazo simple
      if (!accept) {
        offer.status = OfferStatus.DECLINED;
        offer.respondedAt = new Date();
        await offerRepo.save(offer);
        this.gateway.notifyAdmin(travelId, { droverId, declined: true });
        return { accepted: false };
      }

      // aceptación → asignar viaje
      travel.droverId = droverId;
      travel.status = TransferStatus.ASSIGNED;
      // Calcular y persistir compensación (freelance o contratado)
      try {
        const drover = await manager.getRepository(User).findOne({ where: { id: droverId } });
        const km = parseKmFromDistance(travel.distanceTravel);
        if (drover && typeof km === 'number' && km > 0 && this.compensation) {
          const type = String(drover.employmentType || '').toUpperCase();
          const preview = type === 'FREELANCE'
            ? this.compensation.calcFreelancePerTrip(km)
            : this.compensation.calcContractedPerTrip(km);
          travel.driverFee = preview?.driverFee ?? null;
          travel.driverFeeMeta = preview ? { ...preview } : null;
        } else {
          travel.driverFee = null;
          travel.driverFeeMeta = null;
        }
      } catch {}
      await travelRepo.save(travel);

      offer.status = OfferStatus.ACCEPTED;
      offer.respondedAt = new Date();
      await offerRepo.save(offer);

      // invalidar ofertas pendientes
      await offerRepo
        .createQueryBuilder()
        .update(TravelOffer)
        .set({ status: OfferStatus.EXPIRED, respondedAt: () => 'NOW()' })
        .where('travelId = :travelId AND status = :status', {
          travelId,
          status: OfferStatus.PENDING,
        })
        .execute();

      this.gateway.notifyAdmin(travelId, { droverId, accepted: true });
      return { accepted: true };
    });
  }

  async findByClient(clientId: string): Promise<Travels[]> {
    return this.travelsRepo.find({
      where: { idClient: clientId } as FindOptionsWhere<Travels>,
      order: { createdAt: 'DESC' },
    });
  }

  async findByDrover(droverId: string): Promise<Travels[]> {
    return this.travelsRepo.find({
      where: { droverId: droverId } as FindOptionsWhere<Travels>,
      order: { createdAt: 'DESC' },
      relations: this.defaultRelations,
    });
  }

  async updateStatus(id: string, dto: UpdateTravelStatusDto): Promise<void> {
    // permitir opcionalmente droverId junto con status
    const update: Partial<Travels> = { status: dto.status } as any;
    const providedDroverId = (dto as any).droverId as string | undefined;
    if (providedDroverId) {
      (update as any).droverId = providedDroverId;
    }
    await this.travelsRepo.update({ id }, update);
    // Si se asignó drover mediante este endpoint, recalcular driverFee
    try {
      if (providedDroverId) {
        const travel = await this.travelsRepo.findOne({ where: { id } });
        if (travel) {
          const drover = await this.userRepo.findOne({ where: { id: providedDroverId } });
          const km = parseKmFromDistance(travel.distanceTravel);
          if (drover && typeof km === 'number' && km > 0 && this.compensation) {
            const type = String(drover.employmentType || '').toUpperCase();
            const preview = type === 'FREELANCE'
              ? this.compensation.calcFreelancePerTrip(km)
              : this.compensation.calcContractedPerTrip(km);
            travel.driverFee = preview?.driverFee ?? null;
            travel.driverFeeMeta = preview ? { ...preview } : null;
          } else {
            travel.driverFee = null;
            travel.driverFeeMeta = null;
          }
          await this.travelsRepo.save(travel);
        }
      }
    } catch {}
    try {
      // notificación transversal por cambio de estado
      const travel = await this.travelsRepo.findOne({ where: { id } as FindOptionsWhere<Travels> });
      await this.notifications?.create({
        title: 'Estado de traslado actualizado',
        message: `Traslado ${id} → ${dto.status}`,
        roleTarget: UserRole.ADMIN,
        category: 'TRAVEL_UPDATED',
        entityType: 'TRAVEL',
        entityId: id,
        read: false,
        userId: null,
        data: { status: dto.status, clientId: travel?.idClient, droverId: travel?.droverId },
      });
      if (travel?.idClient) {
        await this.notifications?.create({
          title: 'Tu traslado cambió de estado',
          message: `Estado: ${dto.status}`,
          roleTarget: UserRole.CLIENT,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.idClient,
        });
      }
      if (travel?.droverId) {
        await this.notifications?.create({
          title: 'Traslado asignado/actualizado',
          message: `Estado: ${dto.status}`,
          roleTarget: UserRole.DROVER,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.droverId,
        });
      }
    } catch {}
    if (dto?.status === 'REQUEST_FINISH') {
      //TODO:Avisar a todos que el viaje llego bien
      //Enviar correo 5 (cliente, JT)
      const travel = await this.travelsRepo.findOne({
        where: { id } as FindOptionsWhere<Travels>,
        relations: this.defaultRelations,
      });
      this.resend.sendArrivedEmailDJT(travel);
    }
    if (dto?.status === 'CANCELLED') {
      const travelInfo = await this.travelsRepo.findOne({
        where: { id } as FindOptionsWhere<Travels>,
        relations: this.defaultRelations,
      });
      const clientInfo = await this.userRepo.findOne({
        where: { id: travelInfo?.idClient },
      });
      this.resend.sendTransferCancelledEmail(
        clientInfo?.email || '',
        clientInfo?.contactInfo?.fullName || '',
        new Date().toLocaleDateString('es-ES'),
        travelInfo?.startAddress?.city || '',
        travelInfo?.endAddress?.city || '',
        travelInfo?.reasonCancellation || 'No especificado',
      );
    }
  }

  async initTravel(id: string): Promise<void> {
    const currentTravel = await this.travelsRepo.findOne({
      where: { id } as FindOptionsWhere<Travels>,
    });
    if (!currentTravel) {
      throw new NotFoundException(`Travel with id ${id} not found`);
    }
    console.log('currentTravel', currentTravel);
    if (currentTravel.status !== TransferStatus.PICKED_UP) {
      throw new NotFoundException(
        `Travel with id ${id} is not in PICKED_UP status, current status: ${currentTravel.status}`,
      );
    }
    await this.travelsRepo.update(
      { id },
      {
        status: TransferStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    );

    // Notificaciones: inicio de viaje
    try {
      const travel = await this.travelsRepo.findOne({ where: { id } as FindOptionsWhere<Travels> });
      await this.notifications?.create({
        title: 'Viaje iniciado',
        message: `Traslado ${id} en progreso`,
        roleTarget: UserRole.ADMIN,
        category: 'TRAVEL_UPDATED',
        entityType: 'TRAVEL',
        entityId: id,
        read: false,
        userId: null,
        data: { status: TransferStatus.IN_PROGRESS, clientId: travel?.idClient, droverId: travel?.droverId },
      });
      if (travel?.idClient) {
        await this.notifications?.create({
          title: 'Tu traslado ha comenzado',
          message: 'El conductor inició el viaje',
          roleTarget: UserRole.CLIENT,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.idClient,
        });
      }
      if (travel?.droverId) {
        await this.notifications?.create({
          title: 'Has iniciado un traslado',
          message: `${travel.startAddress?.city} → ${travel.endAddress?.city}`,
          roleTarget: UserRole.DROVER,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.droverId,
        });
      }
    } catch {}
  }

  private haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371; // km
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const aVal = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  }

  async finishTravel(id: string, { polyline, currentLat, currentLng }: FinishTravelDto): Promise<void> {
    const trip = await this.travelsRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException(`Travel ${id} not found`);
    if (trip.status !== TransferStatus.IN_PROGRESS)
      throw new BadRequestException('El viaje no está en progreso');
    if (!trip.startedAt)
      throw new BadRequestException(`Travel ${id} no tiene fecha de inicio`);

    // Regla: solo puede finalizar si está a <= 100km del destino
    if (typeof currentLat === 'number' && typeof currentLng === 'number') {
      const end = trip.endAddress as any;
      if (end?.lat != null && end?.lng != null) {
        const distKm = this.haversineDistanceKm({ lat: currentLat, lng: currentLng }, { lat: Number(end.lat), lng: Number(end.lng) });
        if (distKm > 100) {
          throw new BadRequestException(`No puedes finalizar aún: estás a ${distKm.toFixed(1)} km del destino (máximo permitido 100 km).`);
        }
      }
    }
    const now = new Date();
    const diffMs = now.getTime() - trip.startedAt.getTime();
    // convierte ms a minutos y segundos, por ejemplo "12:34"
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    const timeTravel = `${mins}:${secs.toString().padStart(2, '0')}`;

    await this.travelsRepo.update(
      { id },
      {
        status: TransferStatus.REQUEST_FINISH,
        routePolyline: polyline,
        timeTravel,
      },
    );

    // Notificaciones y correo al solicitar finalización
    try {
      const travel = await this.travelsRepo.findOne({
        where: { id } as FindOptionsWhere<Travels>,
        relations: this.defaultRelations,
      });
      await this.notifications?.create({
        title: 'Solicitud de finalización de traslado',
        message: `El traslado ${id} fue marcado para finalizar`,
        roleTarget: UserRole.ADMIN,
        category: 'TRAVEL_UPDATED',
        entityType: 'TRAVEL',
        entityId: id,
        read: false,
        userId: null,
        data: { status: TransferStatus.REQUEST_FINISH, clientId: travel?.idClient, droverId: travel?.droverId },
      });
      if (travel?.idClient) {
        await this.notifications?.create({
          title: 'Tu traslado está por finalizar',
          message: 'El conductor solicitó finalizar el traslado',
          roleTarget: UserRole.CLIENT,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.idClient,
        });
      }
      if (travel?.droverId) {
        await this.notifications?.create({
          title: 'Solicitud de finalización enviada',
          message: 'Se notificó a Administración y al cliente',
          roleTarget: UserRole.DROVER,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.droverId,
        });
      }
      // Correo de aviso de llegada (mismo que en updateStatus)
      this.resend.sendArrivedEmailDJT(travel);
    } catch {}
  }

  async savePickupVerification(
    id: string,
    dto: PickupVerificationDto,
  ): Promise<void> {
    // Validación de ventana horaria de 24 horas respecto a la hora programada
    const travel = await this.travelsRepo.findOne({
      where: { id } as FindOptionsWhere<Travels>,
      relations: this.defaultRelations,
    });
    if (!travel) throw new NotFoundException(`Travel ${id} not found`);

    const scheduled = this.buildLocalDateTime(travel.travelDate || null, travel.travelTime || null);
    if (scheduled) {
      const now = new Date();
      const windowMs = 24 * 60 * 60 * 1000; // 24 horas
      if (scheduled.getTime() < now.getTime() - windowMs) {
        throw new BadRequestException('La hora de recogida ya pasó: ventana de 24 horas expirada.');
      }
      if (scheduled.getTime() > now.getTime() + windowMs) {
        throw new BadRequestException('Aún es temprano para recoger: solo dentro de las 24 horas previas a la hora programada.');
      }
    }

    await this.travelsRepo.update(
      { id },
      { pickupVerification: dto, status: TransferStatus.PICKED_UP },
    );
    // Mandar correo 3 (cliente) y 4 (drover y JT) con travel actualizado (incluye firmas)
    const updatedTravel = { ...travel, pickupVerification: dto } as any;
    this.resend.sendConfirmationPickupEmailClient(updatedTravel);
    this.resend.sendConfirmationPickupEmailDJT(updatedTravel);

    // Notificaciones: vehículo recogido
    try {
      await this.notifications?.create({
        title: 'Vehículo recogido',
        message: `Traslado ${id} recogido por el conductor`,
        roleTarget: UserRole.ADMIN,
        category: 'TRAVEL_UPDATED',
        entityType: 'TRAVEL',
        entityId: id,
        read: false,
        userId: null,
      });
      if (travel?.idClient) {
        await this.notifications?.create({
          title: 'Tu vehículo fue recogido',
          message: `${travel.startAddress?.city} → ${travel.endAddress?.city}`,
          roleTarget: UserRole.CLIENT,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.idClient,
        });
      }
      if (travel?.droverId) {
        await this.notifications?.create({
          title: 'Recogida confirmada',
          message: 'Has confirmado la recogida del vehículo',
          roleTarget: UserRole.DROVER,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.droverId,
        });
      }
    } catch {}
  }

  async saveDeliveryVerification(
    id: string,
    dto: DeliveryVerificationDto,
  ): Promise<void> {
    await this.travelsRepo.update(
      { id },
      { deliveryVerification: dto, status: TransferStatus.DELIVERED },
    );
    //Enviar correo 6 (cliente + JT) y 7 (drover)
    const travel = await this.travelsRepo.findOne({
      where: { id } as FindOptionsWhere<Travels>,
      relations: this.defaultRelations,
    });
    this.resend.sendConfirmationDeliveryEmailCJT(travel);
    this.resend.sendConfirmationDeliveryDrover(travel);

    if (!travel?.client?.email || !travel?.client.contactInfo?.fullName) {
      throw new Error('Faltan datos obligatorios para enviar el correo.');
    }

    if (
      !travel.typeVehicle ||
      !travel.startAddress?.city ||
      !travel.endAddress?.city
    ) {
      throw new Error('Faltan datos obligatorios para enviar el correo.');
    }

    setTimeout(() => {
      const reviewPath = `/resena?travelId=${encodeURIComponent(travel.id)}`;
      this.resend.sendReviewRequestEmail(
        travel?.client?.email,
        travel?.client.contactInfo.fullName,
        new Date().toLocaleDateString('es-ES'),
        travel?.typeVehicle ?? 'Vehículo no especificado',
        travel?.startAddress.city,
        travel?.endAddress.city,
        reviewPath,
      );
    }, 1000);

    // Notificaciones: entrega confirmada
    try {
      await this.notifications?.create({
        title: 'Traslado entregado',
        message: `Traslado ${id} finalizado`,
        roleTarget: UserRole.ADMIN,
        category: 'TRAVEL_UPDATED',
        entityType: 'TRAVEL',
        entityId: id,
        read: false,
        userId: null,
      });
      if (travel?.idClient) {
        await this.notifications?.create({
          title: 'Traslado finalizado',
          message: 'Tu vehículo ha sido entregado',
          roleTarget: UserRole.CLIENT,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.idClient,
        });
      }
      if (travel?.droverId) {
        await this.notifications?.create({
          title: 'Entrega confirmada',
          message: 'Has completado la entrega',
          roleTarget: UserRole.DROVER,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: id,
          read: false,
          userId: travel.droverId,
        });
      }
    } catch {}
  }
}
