import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketStatus } from './entity/support-ticket.entity';
import { SupportMessage, MessageSender } from './entity/support-message.entity';
import { UpdateTicketStatusDTO } from './dto/update-ticket.status.dto';
import { RespondToTicketDTO } from './dto/respond-to-ticket.dto';
import { PublicContactDTO } from './dto/public-contact.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepo: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private messageRepo: Repository<SupportMessage>,
  ) {}

  findAll(): Promise<SupportTicket[]> {
    return this.ticketRepo.find({
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDTO,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    ticket.status = dto.status;
    return this.ticketRepo.save(ticket);
  }

  async respond(id: string, dto: RespondToTicketDTO): Promise<SupportMessage> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    const msg = this.messageRepo.create({
      content: dto.response,
      sender: MessageSender.ADMIN,
      senderName: 'Admin',
      ticket,
      ticketId: ticket.id,
    });
    return this.messageRepo.save(msg);
  }

  async close(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    ticket.status = TicketStatus.CLOSED;
    return this.ticketRepo.save(ticket);
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
    } as any);
    const saved = await this.ticketRepo.save(ticket);
    // registrar primer mensaje
    const msg = this.messageRepo.create({
      content: dto.message,
      sender: MessageSender.CLIENT,
      senderName: dto.name,
      ticketId: saved.id,
    });
    await this.messageRepo.save(msg);
    return saved;
  }
}
