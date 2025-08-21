// src/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  /** Crea una nueva factura */
  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepo.create(createInvoiceDto);
    return this.invoiceRepo.save(invoice);
  }

  /** Devuelve todas las facturas */
  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      order: { invoiceDate: 'DESC' }, // 'ASC' si los quieres del más antiguo al más nuevo
    });
  }

  /** Devuelve una factura por ID */
  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
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
