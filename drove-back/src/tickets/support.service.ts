import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SupportTicket, TicketStatus, TicketPriority, ClientType } from './entity/support-ticket.entity';
import { SupportMessage, MessageSender } from './entity/support-message.entity';
import { UpdateTicketStatusDTO } from './dto/update-ticket.status.dto';
import { RespondToTicketDTO } from './dto/respond-to-ticket.dto';
import { PublicContactDTO } from './dto/public-contact.dto';
import { SupportGateway } from './support.gateway';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepo: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private messageRepo: Repository<SupportMessage>,
    private gateway: SupportGateway,
  ) {}

  findAll(): Promise<SupportTicket[]> {
    return this.ticketRepo.find({
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMessagesDelta(ticketId: string, afterSeq: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);
    const where = afterSeq > 0
      ? { ticketId, seq: MoreThan(afterSeq) }
      : { ticketId } as any;
    const msgs = await this.messageRepo.find({ where, order: { seq: 'ASC' } });
    const lastSeq = msgs.length > 0 ? msgs[msgs.length - 1].seq : afterSeq;
    return { lastSeq, messages: msgs };
  }

  async getOrCreateUserOpenTicket(ownerUserId: string, ownerRole: ClientType, subject = 'Soporte', opts?: { name?: string; email?: string }): Promise<SupportTicket> {
    let ticket = await this.ticketRepo.findOne({ where: { ownerUserId, status: TicketStatus.OPEN } });
    if (!ticket) {
      ticket = this.ticketRepo.create({
      subject,
      message: '',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      clientName: opts?.name || '',
      clientEmail: opts?.email || '',
      clientType: ownerRole,
      ownerUserId,
      ownerRole,
    } as Partial<SupportTicket>);
      ticket = await this.ticketRepo.save(ticket);
    }
    // Completar datos de cliente si estaban vacíos
    const needsUpdate = (!ticket.clientName && opts?.name) || (!ticket.clientEmail && opts?.email);
    if (needsUpdate) {
      ticket.clientName = ticket.clientName || opts?.name || '';
      ticket.clientEmail = ticket.clientEmail || opts?.email || '';
      await this.ticketRepo.save(ticket);
    }
    // Adjuntar historial de mensajes ordenado ascendente por fecha
    const msgs = await this.messageRepo.find({ where: { ticketId: ticket.id }, order: { timestamp: 'ASC' } });
    (ticket as any).messages = msgs;
    return ticket;
  }

  async appendMessage(ticketId: string, content: string, sender: MessageSender, senderName: string, senderUserId?: string): Promise<SupportMessage> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);
    // calcular siguiente secuencia por ticket
    const last = await this.messageRepo.findOne({ where: { ticketId: ticket.id }, order: { seq: 'DESC' } });
    const nextSeq = (last?.seq ?? 0) + 1;
    const msg = this.messageRepo.create({
      content,
      sender,
      senderName,
      senderUserId,
      ticketId: ticket.id,
      seq: nextSeq,
    });
    const saved = await this.messageRepo.save(msg);
    ticket.lastMessageAt = new Date();
    await this.ticketRepo.save(ticket);
    try {
      this.gateway.emitMessage(ticket.id, {
        id: saved.id,
        content: saved.content,
        sender: saved.sender,
        senderName: saved.senderName,
        timestamp: saved.timestamp,
        seq: saved.seq,
        ticketId: ticket.id,
      });
    } catch {}
    return saved;
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDTO,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    ticket.status = dto.status;
    const saved = await this.ticketRepo.save(ticket);
    try { this.gateway.emitStatus(ticket.id, ticket.status); } catch {}
    return saved;
  }

  async respond(id: string, dto: RespondToTicketDTO): Promise<SupportMessage> {
    return this.appendMessage(id, dto.response, MessageSender.ADMIN, 'Admin');
  }

  async close(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    ticket.status = TicketStatus.CLOSED;
    const saved = await this.ticketRepo.save(ticket);
    try {
      this.gateway.emitClosed(ticket.id);
      this.gateway.emitStatus(ticket.id, 'closed');
    } catch {}
    return saved;
  }

  async createPublic(dto: PublicContactDTO): Promise<SupportTicket> {
    const ticket = this.ticketRepo.create({
      clientEmail: dto.email,
      clientName: dto.name,
      subject: dto.subject,
      message: dto.message,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      clientType: ClientType.CLIENT,
    } as Partial<SupportTicket>);
    const saved: SupportTicket = await this.ticketRepo.save(ticket);
    // registrar primer mensaje
    await this.appendMessage(saved.id, dto.message, MessageSender.CLIENT, dto.name);
    return saved;
  }
}
