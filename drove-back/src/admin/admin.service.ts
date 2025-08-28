// src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ResendService } from '../resend/resend.service';
import { User, UserRole, UserStatus } from '../user/entities/user.entity';
import { Payment, PaymentStatus } from '../payment/entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Travels } from '../travels/entities/travel.entity';
import { TransferStatus } from '../travels/entities/travel.entity';
import { DetailedUser, FavoriteRoute } from '../user/dtos/detailed-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '../user/entities/user.entity';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Travels)
    private readonly transferRepo: Repository<Travels>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    private readonly resend: ResendService,
    private readonly notifications?: NotificationsService,
  ) {}

  private readonly defaultRelations = ['payments', 'client', 'drover'];
  /* ─────────── Usuarios ─────────── */

  async getPendingUsers(): Promise<User[]> {
    return this.userRepo.find({ where: { status: UserStatus.PENDING } });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.find();
  }

  async getDetailedUserProfile(userId: string): Promise<DetailedUser> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['travelsAsClient'],
    });

    if (!user) throw new NotFoundException('User not found');

    const travels = user.travelsAsClient;

    // ➊ total spent
    const totalSpent = travels.reduce((sum, t) => sum + (t.totalPrice ?? 0), 0);

    // ➋ favorite routes
    const routeMap = new Map<string, FavoriteRoute>();
    travels.forEach((t) => {
      const origin = t.startAddress?.city ?? 'Unknown';
      const destination = t.endAddress?.city ?? 'Unknown';
      const key = `${origin}->${destination}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, { origin, destination, count: 0 });
      }
      routeMap.get(key)!.count += 1;
    });

    const vehicleMap = new Map<string, number>();
    travels.forEach((t) => {
      const type = t.typeVehicle ?? 'Unknown';
      vehicleMap.set(type, (vehicleMap.get(type) ?? 0) + 1);
    });

    // ➍ build response
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
      contactInfo: {
        fullName: user.contactInfo.fullName,
        phone: user.contactInfo.phone,
        documentId: user.contactInfo.documentId,
        address: user.contactInfo.address || '',
        city: user.contactInfo.city || '',
        province: user.contactInfo.state || '',
        country: user.contactInfo.country || '',
        zipCode: user.contactInfo.zip || '',
      },
      totalSpent,
      tripsCount: travels.length,
      favoriteRoutes: Array.from(routeMap.values()),
      vehicleStats: Array.from(vehicleMap.entries()).map(([type, count]) => ({
        type,
        count,
      })),
    };
  }

  async approveUser(id: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    user.status = UserStatus.APPROVED;
    await this.userRepo.save(user);
    if (user.role !== UserRole.TRAFFICBOSS) {
      // Si es drover, enviar correo de aprobación
      await this.resend.sendAccountApprovedEmail(
        user.email,
        user.contactInfo.fullName,
      );
    } else {
      await this.resend.sendTrafficManagerActivatedEmail(
        user.email,
        user.contactInfo.fullName,
        'Admin approved',
      );
    }

    return { success: true };
  }

  async rejectUser(id: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    user.status = UserStatus.REJECTED;
    await this.userRepo.save(user);
    await this.resend.sendAccountRejectedEmail(
      user.email,
      user.contactInfo.fullName,
      'Admin declined',
    );
    return { success: true };
  }

  async updateUserRole(id: string, role: UserRole): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    user.role = role;
    await this.userRepo.save(user);
    return true;
  }

  /* ─────────── Pagos ─────────── */

  async getTransfersWithPendingPayments() {
    const payments = await this.paymentRepo.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['travel', 'travel.drover', 'travel.client'],
    });
    return { payments };
  }

  async confirmPayment(id: number, adminId: string): Promise<boolean> {
    if (!adminId) {
      // facilitar validación esperada por tests
      throw new BadRequestException('adminId is required');
    }
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['travel'],
    });
    if (!payment) throw new NotFoundException();
    payment.status = PaymentStatus.CONFIRMED;
    payment.confirmedBy = adminId;
    payment.confirmedAt = new Date();
    await this.paymentRepo.save(payment);
    const userDetails = await this.userRepo.findOne({
      where: { id: payment.travel.idClient },
    });
    await this.resend.sendTransferPendingBillingEmail(
      userDetails?.email || '',
      userDetails?.contactInfo?.fullName || '',
      `${payment.travel.brandVehicle} ${payment.travel.modelVehicle} - ${payment.travel.patentVehicle}`,
      payment.travel.startAddress.city,
      payment.travel.endAddress.city,
      payment.travel.travelDate || new Date().toISOString(),
      `https://admin.drove.app/transfers/${payment.travel.id}`,
    );
    return true;
  }

  /* ─────────── Facturación ─────────── */

  async getTransfersPendingInvoice() {
    const invoices = await this.invoiceRepo.find({
      where: { status: InvoiceStatus.DRAFT },
      relations: ['travel'],
    });
    return { invoices };
  }

  async issueInvoice(
    id: number,
    adminId: string,
    number: string,
  ): Promise<boolean> {
    if (!adminId || !number) {
      throw new BadRequestException('adminId and invoiceNumber are required');
    }
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException();
    invoice.status = InvoiceStatus.SENT;
    invoice.issuedBy = adminId;
    invoice.issuedAt = new Date();
    invoice.invoiceNumber = number;
    await this.invoiceRepo.save(invoice);
    return true;
  }

  /* ─────────── Traslados ─────────── */

  async getAdminTransfers(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate && filters?.endDate) {
      // La entidad no tiene campo "date"; usar createdAt o travelDate
      where.createdAt = Between(filters.startDate, filters.endDate);
    }

    const transfers = await this.transferRepo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: this.defaultRelations, // <-- trae payments, client y drover
    });

    return { transfers };
  }

  async assignDriverToTransfer(
    transferId: string,
    droverId: string,
    adminId: string,
  ): Promise<boolean> {
    if (!droverId || !adminId) {
      throw new BadRequestException('droverId and adminId are required');
    }
    const transfer = await this.transferRepo.findOne({
      where: { id: transferId },
      relations: this.defaultRelations,
    });
    if (!transfer) throw new NotFoundException();
    if (transfer.droverId !== null && transfer.droverId !== droverId) {
      //Enviar correo 1 (cliente) y 2 (drover + JT)
      const drover = await this.userRepo.findOne({ where: { id: droverId } });
      await this.resend.sendDriverAssignedEmail(
        '',
        transfer.typeVehicle ?? 'Vehículo no especificado',
        new Date().toISOString(),
        transfer.startAddress.city,
        transfer.endAddress.city,
        drover?.contactInfo?.fullName ?? 'Conductor',
        `https://base/traslados/${transfer.id}`,
        new Date().getFullYear().toString(),
      );
      await this.resend.sendTransferAssignedEmailDJT(transfer);
    } else {
      //Enviar correo 1 (cliente) y 2 (drover + JT)
      await this.resend.sendTransferAssignedEmailClient(transfer);
      await this.resend.sendTransferAssignedEmailDJT(transfer);
    }
    transfer.droverId = droverId;
    transfer.assignedBy = adminId;
    transfer.assignedAt = new Date();
    transfer.status = TransferStatus.ASSIGNED; // Asignar
    const resultSave = await this.transferRepo.save(transfer);

    // Notificaciones transversales: cliente y drover deben enterarse
    try {
      await this.notifications?.create({
        title: 'Conductor asignado',
        message: `Tu traslado ${transfer.id} fue asignado a un conductor`,
        roleTarget: UserRole.CLIENT,
        category: 'TRAVEL_UPDATED',
        entityType: 'TRAVEL',
        entityId: transfer.id,
        read: false,
        userId: transfer.idClient,
      });
      if (transfer.droverId) {
        await this.notifications?.create({
          title: 'Se te asignó un traslado',
          message: `${transfer.startAddress?.city} → ${transfer.endAddress?.city}`,
          roleTarget: UserRole.DROVER,
          category: 'TRAVEL_UPDATED',
          entityType: 'TRAVEL',
          entityId: transfer.id,
          read: false,
          userId: transfer.droverId,
        });
      }
    } catch {}

    return true;
  }

  async getReportData(): Promise<any> {
    // 1) Totales
    const totalTransfers = await this.transferRepo.count();
    const rawRev = await this.transferRepo
      .createQueryBuilder('t')
      .select('SUM(t.totalPrice)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalRevenue = Number(rawRev?.sum) || 0;

    // 2) Conductores activos y tasa de completitud
    const activeDrivers = await this.userRepo.count({
      where: { role: UserRole.DROVER, status: UserStatus.APPROVED },
    });
    const completed = await this.transferRepo.count({
      where: { status: TransferStatus.DELIVERED },
    });
    const completionRate = totalTransfers
      ? (completed / totalTransfers) * 100
      : 0;

    // 3) Crecimiento mensual
    const rawThis = await this.transferRepo
      .createQueryBuilder('t')
      .select('SUM(t.totalPrice)', 'sum')
      .where("DATE_TRUNC('month', t.createdAt) = DATE_TRUNC('month', NOW())")
      .getRawOne<{ sum: string }>();
    const rawLast = await this.transferRepo
      .createQueryBuilder('t')
      .select('SUM(t.totalPrice)', 'sum')
      .where(
        "DATE_TRUNC('month', t.createdAt) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')",
      )
      .getRawOne<{ sum: string }>();
    const thisSum = Number(rawThis?.sum) || 0;
    const lastSum = Number(rawLast?.sum) || 1;
    const monthlyGrowth = ((thisSum - lastSum) / lastSum) * 100;

    // 4) Métricas específicas
    const drivers = activeDrivers;
    const clients = await this.userRepo.count({
      where: { role: UserRole.CLIENT },
    });
    const transfers = totalTransfers;
    const revenue = totalRevenue;

    // 5) Estado de transferencias
    const statusCounts = await this.transferRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.status')
      .getRawMany<{ status: string; count: string }>();
    const transferStatus = statusCounts.map((r) => ({
      status: r.status,
      count: Number(r.count),
      percentage: totalTransfers ? (Number(r.count) / totalTransfers) * 100 : 0,
    }));

    // 6) Top clientes (alias en minúsculas)
    const topClientsRaw = await this.transferRepo
      .createQueryBuilder('t')
      .select('t.idClient', 'id')
      .addSelect('COUNT(*)', 'total_transfers')
      .addSelect('SUM(t.totalPrice)', 'total_spent')
      .groupBy('t.idClient')
      .orderBy('total_spent', 'DESC')
      .limit(5)
      .getRawMany<{
        id: string;
        total_transfers: string;
        total_spent: string;
      }>();
    const topClients = await Promise.all(
      topClientsRaw.map(async (r) => {
        const u = await this.userRepo.findOne({ where: { id: r.id } });
        return {
          id: r.id,
          name: u?.email ?? '',
          email: u?.email ?? '',
          totalTransfers: Number(r.total_transfers),
          totalSpent: Number(r.total_spent),
        };
      }),
    );

    // 7) Top drovers
    const topDroversRaw = await this.transferRepo
      .createQueryBuilder('t')
      .select('t.droverId', 'id')
      .addSelect('COUNT(*)', 'total_transfers')
      .addSelect('SUM(t.totalPrice)', 'total_earned')
      .where('t.droverId IS NOT NULL')
      .groupBy('t.droverId')
      .orderBy('total_earned', 'DESC')
      .limit(5)
      .getRawMany<{
        id: string;
        total_transfers: string;
        total_earned: string;
      }>();
    const topDrovers = await Promise.all(
      topDroversRaw.map(async (r) => {
        const u = await this.userRepo.findOne({ where: { id: r.id } });
        return {
          id: r.id,
          name: u?.email ?? '',
          email: u?.email ?? '',
          totalTransfers: Number(r.total_transfers),
          totalEarned: Number(r.total_earned),
          rating: 0,
        };
      }),
    );

    // 8) Top rutas
    const routesRaw = await this.transferRepo
      .createQueryBuilder('t')
      .select('t.routePolyline', 'route')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.routePolyline')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany<{ route: string; count: string }>();
    const topRoutes = routesRaw.map((r) => ({
      route: r.route,
      count: Number(r.count),
    }));

    return {
      totalTransfers,
      totalRevenue,
      activeDrivers,
      completionRate,
      monthlyGrowth,

      transfers,
      revenue,
      drivers,
      clients,

      transferStatus,
      paymentMethods: [], // si aún no los implementas
      paymentStatus: [], // idem

      topClients,
      topDrovers,
      topRoutes,
    };
  }
  /* ─────────── Métricas ─────────── */

  async getBusinessMetrics(start?: string, end?: string, clientType?: string) {
    const qb = this.transferRepo
      .createQueryBuilder('t')
      .select('COUNT(t.id)', 'totalTransfers')
      .addSelect('SUM(t.totalPrice)', 'totalRevenue');

    if (start) qb.andWhere('t.createdAt >= :start', { start });
    if (end) qb.andWhere('t.createdAt <= :end', { end });
    // clientType no existe en travels; métrica por tipo de cliente requeriría join con users

    const raw = await qb.getRawOne();
    return {
      totalTransfers: Number(raw.totalTransfers ?? 0),
      totalRevenue: Number(raw.totalRevenue ?? 0),
    };
  }
}
