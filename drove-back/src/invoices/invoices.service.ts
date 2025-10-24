// src/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Travels } from '../travels/entities/travel.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Travels)
    private readonly travelsRepo: Repository<Travels>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Crea una nueva factura */
  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepo.create(createInvoiceDto);
    return this.invoiceRepo.save(invoice);
  }

  /**
   * Devuelve facturas con filtros opcionales y paginación. Une travel para enriquecer datos.
   */
  async findAll(params?: {
    search?: string;
    status?: string;
    clientId?: string;
    clientName?: string;
    transferStatus?: string;
    droverId?: string;
    droverName?: string;
    from?: string;
    to?: string;
    method?: string;
    onlyPending?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Invoice[]> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 50));

    const where: any = {};
    // Normalizar estado (acepta español e inglés). 'ADVANCE' no siempre existe en el enum → filtrar luego
    let normalizedForWhere: string | undefined;
    if (params?.status) {
      const normalized = String(params.status || '').toUpperCase();
      const map: Record<string, string> = {
        EMITIDA: 'SENT',
        ANTICIPO: 'ADVANCE',
        PAGADA: 'PAID',
        PAID: 'PAID',
        SENT: 'SENT',
        DRAFT: 'DRAFT',
        BORRADOR: 'DRAFT',
        VOID: 'VOID',
        VOIDED: 'VOID',
        REJECTED: 'REJECTED',
        RECHAZADA: 'REJECTED',
        ANULADA: 'VOID',
      };
      const finalStatus = map[normalized] ?? normalized;
      if (finalStatus !== 'ADVANCE') normalizedForWhere = finalStatus;
    }
    if (normalizedForWhere) where.status = normalizedForWhere as any;
    if (params?.clientId) where.customerId = params.clientId;
    if (params?.from || params?.to) {
      // invoiceDate es DATE, aplicamos rango con Between manual via query builder por flexibilidad
    }
    if (params?.method) where.paymentMethod = params.method as any;
    if (params?.onlyPending) where.status = where.status || 'SENT';

    // Base: traemos página con orden
    const [invoices, total] = await this.invoiceRepo.findAndCount({
      where,
      order: { invoiceDate: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (!invoices?.length) return invoices;
    const ids = Array.from(new Set(invoices.map((i) => i.travelId).filter(Boolean)));
    if (ids.length === 0) return invoices;
    let qb = this.travelsRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.client', 'client')
      .leftJoinAndSelect('t.drover', 'drover')
      .where('t.id IN (:...ids)', { ids });

    // Filtros avanzados en travel: clientName, droverName, transferStatus y search
    if (params?.transferStatus) {
      qb = qb.andWhere('LOWER(t.status) = LOWER(:tstatus)', { tstatus: params.transferStatus });
    }
    if (params?.clientName) {
      qb = qb.andWhere('LOWER(client.contactInfo->>\'fullName\') = LOWER(:cname)', { cname: params.clientName });
    }
    if (params?.droverName) {
      qb = qb.andWhere('LOWER(drover.contactInfo->>\'fullName\') = LOWER(:dname)', { dname: params.droverName });
    }
    if (params?.search) {
      const term = `%${params.search.toLowerCase()}%`;
      qb = qb.andWhere(
        "LOWER(COALESCE(client.contactInfo->>'fullName','')) LIKE :term OR LOWER(COALESCE(drover.contactInfo->>'fullName','')) LIKE :term OR LOWER(COALESCE(t.startAddress,'')) LIKE :term OR LOWER(COALESCE(t.endAddress,'')) LIKE :term",
        { term },
      );
    }
    if (params?.from) {
      qb = qb.andWhere('t.createdAt >= :from', { from: new Date(params.from) });
    }
    if (params?.to) {
      const toDate = new Date(params.to);
      toDate.setHours(23, 59, 59, 999);
      qb = qb.andWhere('t.createdAt <= :to', { to: toDate });
    }

    const travels = await qb.getMany();
    const map = new Map<string, Travels>(travels.map((t) => [t.id, t]));
    // surface ADVANCE alias if stored via issuedBy sentinel
    let enriched = invoices.map((inv) => {
      const withTravel = { ...inv, travel: map.get(inv.travelId!) } as any;
      if (withTravel?.issuedBy === '__ADVANCE__' && String(withTravel.status).toUpperCase() === 'SENT') {
        withTravel.status = 'ADVANCE';
      }
      return withTravel;
    });

    // Si el filtro solicitado fue 'ADVANCE', aplicar ahora sobre el enriquecido
    if (params?.status && String(params.status).toUpperCase() === 'ANTICIPO') {
      enriched = enriched.filter((i: any) => String(i.status).toUpperCase() === 'ADVANCE');
    } else if (params?.status && String(params.status).toUpperCase() === 'ADVANCE') {
      enriched = enriched.filter((i: any) => String(i.status).toUpperCase() === 'ADVANCE');
    }

    // Filtro onlyPending a nivel combinado (por si se cambió el where.status)
    if (params?.onlyPending) {
      enriched = enriched.filter((i: any) => String(i.status).toUpperCase() !== 'PAID');
    }

    return enriched;
  }

  /** Devuelve una factura por ID y resuelve travel por travelId */
  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    if (invoice.travelId) {
      const travel = await this.travelsRepo.findOne({ where: { id: invoice.travelId } as any, relations: { client: true, drover: true } as any });
      (invoice as any).travel = travel || null;
    }
    return invoice as any;
  }

  /** Actualiza una factura */
  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, updateInvoiceDto);
    return this.invoiceRepo.save(invoice);
  }

  /** Elimina una factura */
  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepo.remove(invoice);
  }
}
