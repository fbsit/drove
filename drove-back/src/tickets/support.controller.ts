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

@ApiTags('Support')
@Controller('admin/support/tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tickets de soporte' })
  getAll() {
    return this.supportService.findAll();
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de ticket' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTicketStatusDTO })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDTO) {
    return this.supportService.updateStatus(id, dto);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Responder a un ticket' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: RespondToTicketDTO })
  @HttpCode(HttpStatus.CREATED)
  respond(@Param('id') id: string, @Body() dto: RespondToTicketDTO) {
    return this.supportService.respond(id, dto);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Cerrar ticket' })
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  close(@Param('id') id: string) {
    return this.supportService.close(id);
  }
}
