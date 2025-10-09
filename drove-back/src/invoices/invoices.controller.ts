import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Invoice } from './entities/invoice.entity';
import { JwtOrTestGuard } from '../common/guards/jwt-or-test.guard';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtOrTestGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear factura' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiCreatedResponse({ type: Invoice })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar facturas' })
  @ApiOkResponse({ type: [Invoice] })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('clientName') clientName?: string,
    @Query('transferStatus') transferStatus?: string,
    @Query('droverId') droverId?: string,
    @Query('droverName') droverName?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('method') method?: string,
    @Query('onlyPending') onlyPending?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findAll({
      search,
      status,
      clientId,
      clientName,
      transferStatus,
      droverId,
      droverName,
      from,
      to,
      method,
      onlyPending: onlyPending === 'true' || onlyPending === '1',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener factura por ID' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: Invoice })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar factura' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiOkResponse({ type: Invoice })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(+id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar factura' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(+id);
  }
}
