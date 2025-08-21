import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  findAll() {
    return this.invoicesService.findAll();
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
