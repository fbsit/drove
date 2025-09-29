import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async getOrCreateUserOpenTicket(ownerUserId: string, ownerRole: ClientType, subject = 'Soporte'): Promise<SupportTicket> {
    let ticket = await this.ticketRepo.findOne({ where: { ownerUserId, status: TicketStatus.OPEN } });
    if (ticket) return ticket;
    ticket = this.ticketRepo.create({
      subject,
      message: '',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      clientName: '',
      clientEmail: '',
      clientType: ownerRole,
      ownerUserId,
      ownerRole,
    } as Partial<SupportTicket>);
    return this.ticketRepo.save(ticket);
  }

  async appendMessage(ticketId: string, content: string, sender: MessageSender, senderName: string, senderUserId?: string): Promise<SupportMessage> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);
    const msg = this.messageRepo.create({
      content,
      sender,
      senderName,
      senderUserId,
      ticketId: ticket.id,
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
    try { this.gateway.emitClosed(ticket.id); } catch {}
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
