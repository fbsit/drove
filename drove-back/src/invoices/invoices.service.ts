// src/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  /** Devuelve todas las facturas; une a nivel de servicio por travelId usando travelsRepo */
  async findAll(): Promise<Invoice[]> {
    const invoices = await this.invoiceRepo.find({ order: { invoiceDate: 'DESC' } });
    if (!invoices?.length) return invoices;
    const ids = Array.from(new Set(invoices.map((i) => i.travelId).filter(Boolean)));
    if (ids.length === 0) return invoices;
    const travels = await this.travelsRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.client', 'client')
      .leftJoinAndSelect('t.drover', 'drover')
      .where('t.id IN (:...ids)', { ids })
      .getMany();
    const map = new Map<string, Travels>(travels.map((t) => [t.id, t]));
    return invoices.map((inv) => ({ ...inv, travel: map.get(inv.travelId!) } as any));
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
