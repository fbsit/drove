// src/support/support.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { UpdateTicketStatusDTO } from './dto/update-ticket.status.dto';
import { RespondToTicketDTO } from './dto/respond-to-ticket.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PublicContactDTO } from './dto/public-contact.dto';
import { JwtOrTestGuard } from '../common/guards/jwt-or-test.guard';
import { MyMessageDTO } from './dto/my-message.dto';
import { ClientType } from './entity/support-ticket.entity';

@ApiTags('Support')
@Controller()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('admin/support/tickets')
  @ApiOperation({ summary: 'Listar tickets de soporte' })
  getAll() {
    return this.supportService.findAll();
  }

  @Get('admin/support/tickets/:id/messages')
  @ApiOperation({ summary: 'Delta de mensajes por ticket (admin)' })
  @ApiParam({ name: 'id' })
  getMessagesDeltaAdmin(@Param('id') id: string, @Query('afterSeq') afterSeq?: string) {
    const n = Number(afterSeq ?? 0);
    return this.supportService.getMessagesDelta(id, isNaN(n) ? 0 : n);
  }

  @Put('admin/support/tickets/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de ticket' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTicketStatusDTO })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDTO) {
    return this.supportService.updateStatus(id, dto);
  }

  @Post('admin/support/tickets/:id/respond')
  @ApiOperation({ summary: 'Responder a un ticket' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: RespondToTicketDTO })
  @HttpCode(HttpStatus.CREATED)
  respond(@Param('id') id: string, @Body() dto: RespondToTicketDTO) {
    return this.supportService.respond(id, dto);
  }

  @Put('admin/support/tickets/:id/close')
  @ApiOperation({ summary: 'Cerrar ticket' })
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  close(@Param('id') id: string) {
    return this.supportService.close(id);
  }

  // Público: crear ticket sin auth
  @Post('support/tickets')
  @ApiOperation({ summary: 'Crear ticket de soporte (público, sin token)' })
  @ApiBody({ type: PublicContactDTO })
  @HttpCode(HttpStatus.CREATED)
  createPublic(@Body() dto: PublicContactDTO) {
    return this.supportService.createPublic(dto);
  }

  // Autenticado: obtener mi ticket abierto o null
  @UseGuards(JwtOrTestGuard)
  @Get('support/my/open')
  @ApiOperation({ summary: 'Obtener ticket abierto del usuario autenticado' })
  getMyOpen(@Req() req) {
    const role = String(req.user.role || '').toLowerCase() === 'drover' ? ClientType.DROVER : ClientType.CLIENT;
    return this.supportService.getOrCreateUserOpenTicket(req.user.id, role, 'Soporte', { name: req.user?.full_name || req.user?.name, email: req.user?.email });
  }

  // Autenticado: listar mis tickets
  @UseGuards(JwtOrTestGuard)
  @Get('support/my')
  @ApiOperation({ summary: 'Listar tickets del usuario autenticado' })
  async myTickets(@Req() req) {
    const all = await this.supportService.findAll();
    return all.filter(t => t.ownerUserId === req.user.id);
  }

  // Autenticado: enviar mensaje a mi ticket abierto
  @UseGuards(JwtOrTestGuard)
  @Post('support/my/messages')
  @ApiOperation({ summary: 'Enviar mensaje al ticket abierto' })
  @ApiBody({ type: MyMessageDTO })
  @HttpCode(HttpStatus.CREATED)
  async myMessage(@Req() req, @Body() dto: MyMessageDTO) {
    const role = String(req.user.role || '').toLowerCase() === 'drover' ? ClientType.DROVER : ClientType.CLIENT;
    const ticket = await this.supportService.getOrCreateUserOpenTicket(req.user.id, role, 'Soporte', { name: req.user?.full_name || req.user?.name, email: req.user?.email });
    const sender = role === ClientType.DROVER ? 'drover' : 'client';
    return this.supportService.appendMessage(ticket.id, dto.content, sender as any, req.user.email || 'Usuario', req.user.id);
  }

  @UseGuards(JwtOrTestGuard)
  @Get('support/my/messages')
  @ApiOperation({ summary: 'Delta de mensajes de mi ticket abierto' })
  async myMessagesDelta(@Req() req) {
    const role = String(req.user.role || '').toLowerCase() === 'drover' ? ClientType.DROVER : ClientType.CLIENT;
    const ticket = await this.supportService.getOrCreateUserOpenTicket(req.user.id, role);
    const afterSeq = Number((req.query?.afterSeq as string) ?? 0);
    return this.supportService.getMessagesDelta(ticket.id, afterSeq);
  }

  // Autenticado: cerrar mi ticket
  @UseGuards(JwtOrTestGuard)
  @Put('support/my/close')
  @ApiOperation({ summary: 'Cerrar mi ticket abierto' })
  async myClose(@Req() req) {
    const role = String(req.user.role || '').toLowerCase() === 'drover' ? ClientType.DROVER : ClientType.CLIENT;
    const ticket = await this.supportService.getOrCreateUserOpenTicket(req.user.id, role);
    return this.supportService.close(ticket.id);
  }
}
