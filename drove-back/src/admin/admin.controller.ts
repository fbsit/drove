// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  ParseEnumPipe,
  ParseIntPipe,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { UserRole } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtOrTestGuard } from '../common/guards/jwt-or-test.guard';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtOrTestGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /* ─────────── Usuarios ─────────── */

  /** GET /admin/users/pending */
  @Get('users/pending')
  @ApiOperation({ summary: 'Listar usuarios pendientes de aprobación' })
  getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  /** GET /admin/users */
  @Get('users')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  /** GET /admin/users/:id */
  @Get('users/:userId')
  @ApiOperation({ summary: 'Obtener detalle de usuario' })
  @ApiParam({ name: 'userId' })
  getUserById(@Param('userId') userId: string) {
    return this.adminService.getDetailedUserProfile(userId);
  }

  /** POST /admin/users/:id/approve */
  @Get('users/:userId/approve')
  @ApiOperation({ summary: 'Aprobar usuario' })
  @ApiParam({ name: 'userId' })
  approveUser(@Param('userId') userId: string) {
    return this.adminService.approveUser(userId);
  }

  /** POST /admin/users/:id/reject */
  @Get('users/:userId/reject')
  @ApiOperation({ summary: 'Rechazar usuario' })
  @ApiParam({ name: 'userId' })
  rejectUser(@Param('userId') userId: string) {
    return this.adminService.rejectUser(userId);
  }

  /** PATCH /admin/users/:id/role  (body: { role: 'CLIENT'|'DRIVER'|'ADMIN' }) */
  @Patch('users/:userId/role')
  @ApiOperation({ summary: 'Actualizar rol de usuario' })
  @ApiParam({ name: 'userId' })
  @ApiBody({ schema: { properties: { role: { enum: Object.values(UserRole) } } } })
  @ApiOkResponse({ schema: { type: 'boolean', example: true } })
  updateUserRole(
    @Param('userId') userId: string,
    @Body('role', new ParseEnumPipe(UserRole)) role: UserRole,
    @Res() res: Response,
  ) {
    return this.adminService
      .updateUserRole(userId, role)
      .then((ok) => res.status(HttpStatus.OK).json(ok));
  }

  /* ─────────── Pagos ─────────── */

  /** GET /admin/payments/pending */
  @Get('payments/pending')
  @ApiOperation({ summary: 'Listar traslados con pagos pendientes' })
  getTransfersWithPendingPayments() {
    return this.adminService.getTransfersWithPendingPayments();
  }

  /** POST /admin/payments/:id/confirm */
  @Post('payments/:paymentId/confirm')
  @ApiOperation({ summary: 'Confirmar pago' })
  @ApiParam({ name: 'paymentId' })
  @ApiBody({ schema: { properties: { adminId: { type: 'string' } } } })
  @ApiCreatedResponse({ schema: { type: 'boolean', example: true } })
  confirmPayment(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body('adminId') adminId: string,
    @Res() res: Response,
  ) {
    return this.adminService
      .confirmPayment(paymentId, adminId)
      .then((ok) => res.status(HttpStatus.CREATED).json(ok));
  }

  /* ─────────── Facturas ─────────── */

  /** GET /admin/invoices/pending */
  @Get('invoices/pending')
  @ApiOperation({ summary: 'Listar traslados pendientes de facturar' })
  getTransfersPendingInvoice() {
    return this.adminService.getTransfersPendingInvoice();
  }

  /** POST /admin/invoices/:id/issue */
  @Post('invoices/:invoiceId/issue')
  @ApiOperation({ summary: 'Emitir factura' })
  @ApiParam({ name: 'invoiceId' })
  @ApiBody({ schema: { properties: { adminId: { type: 'string' }, invoiceNumber: { type: 'string' } } } })
  @ApiCreatedResponse({ schema: { type: 'boolean', example: true } })
  issueInvoice(
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
    @Body('adminId') adminId: string,
    @Body('invoiceNumber') invoiceNumber: string,
    @Res() res: Response,
  ) {
    return this.adminService
      .issueInvoice(invoiceId, adminId, invoiceNumber)
      .then((ok) => res.status(HttpStatus.CREATED).json(ok));
  }

  /** PUT /admin/invoices/:id/status */
  @Put('invoices/:invoiceId/status')
  @ApiOperation({ summary: 'Actualizar estado de factura' })
  @ApiParam({ name: 'invoiceId' })
  @ApiBody({ schema: { properties: { status: { enum: ['DRAFT','SENT','PAID','VOID','REJECTED'] } } } })
  updateInvoiceStatus(
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
    @Body('status') status: 'DRAFT'|'SENT'|'PAID'|'VOID'|'REJECTED',
    @Res() res: Response,
  ) {
    return this.adminService
      .updateInvoiceStatus(invoiceId, status)
      .then((ok) => res.status(HttpStatus.OK).json(ok));
  }

  /** PATCH /admin/invoices/:id/status (alias) */
  @Patch('invoices/:invoiceId/status')
  @ApiOperation({ summary: 'Actualizar estado de factura (alias PATCH)' })
  @ApiParam({ name: 'invoiceId' })
  @ApiBody({ schema: { properties: { status: { type: 'string' } } } })
  updateInvoiceStatusPatch(
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
    @Body('status') status: string,
    @Res() res: Response,
  ) {
    return this.adminService
      .updateInvoiceStatus(invoiceId, status)
      .then((ok) => res.status(HttpStatus.OK).json(ok));
  }

  /* ─────────── Traslados ─────────── */

  /** GET /admin/transfers?status=&startDate=&endDate= */
  @Get('transfers')
  @ApiOperation({ summary: 'Listar traslados con filtros' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getAdminTransfers(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAdminTransfers({ status, startDate, endDate });
  }

  @Get('reports')
  @ApiOperation({ summary: 'Obtener datos para reportes' })
  async getReports() {
    return this.adminService.getReportData();
  }

  /** POST /admin/reports/generate */
  @Post('reports/generate')
  @ApiOperation({ summary: 'Generar reporte con filtros (side-effect o respuesta inmediata)' })
  @ApiBody({ schema: { type: 'object', properties: { filters: { type: 'object', additionalProperties: true } } } })
  @ApiCreatedResponse({ description: 'Reporte generado', schema: { type: 'object', additionalProperties: true } })
  async generateReports(@Body('filters') filters: any, @Res() res: Response) {
    const data = await this.adminService.generateReport(filters || {});
    return res.status(HttpStatus.CREATED).json(data);
  }

  /** POST /admin/transfers/:id/assign */
  @Post('transfers/:transferId/assign')
  @ApiOperation({ summary: 'Asignar drover a traslado' })
  @ApiParam({ name: 'transferId' })
  @ApiBody({ schema: { properties: { droverId: { type: 'string' }, adminId: { type: 'string' } } } })
  @ApiCreatedResponse({ schema: { type: 'boolean', example: true } })
  assignDriverToTransfer(
    @Param('transferId') transferId: string,
    @Body('droverId') droverId: string,
    @Body('adminId') adminId: string,
    @Res() res: Response,
  ) {
    return this.adminService
      .assignDriverToTransfer(transferId, droverId, adminId)
      .then((ok) => res.status(HttpStatus.CREATED).json(ok));
  }

  /** POST /admin/transfers/:id/cancel */
  @Post('transfers/:transferId/cancel')
  @ApiOperation({ summary: 'Cancelar/Rechazar traslado con motivo' })
  @ApiParam({ name: 'transferId' })
  @ApiBody({ schema: { properties: { reason: { type: 'string' }, adminId: { type: 'string' } } } })
  @ApiCreatedResponse({ schema: { type: 'boolean', example: true } })
  cancelTransfer(
    @Param('transferId') transferId: string,
    @Body('reason') reason: string,
    @Body('adminId') adminId: string,
    @Res() res: Response,
  ) {
    return this.adminService
      .cancelTransfer(transferId, reason, adminId)
      .then((ok) => res.status(HttpStatus.CREATED).json(ok));
  }

  /* ─────────── Métricas ─────────── */

  /** GET /admin/metrics?startDate=&endDate=&clientType= */
  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas de negocio' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'clientType', required: false })
  getBusinessMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clientType') clientType?: string,
  ) {
    return this.adminService.getBusinessMetrics(startDate, endDate, clientType);
  }
}
