import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Header } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear notificación' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Listar notificaciones del usuario actual' })
  findAll(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const role = String(req.user?.role || 'CLIENT').toUpperCase();
    return this.notificationsService.findAllForUser(userId, role);
  }

  @Get('unread-count')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Contar notificaciones no leídas del usuario actual' })
  unreadCount(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const role = String(req.user?.role || 'CLIENT').toUpperCase();
    return this.notificationsService.countUnreadForUser(userId, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar notificación' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateNotificationDto })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    if (updateNotificationDto && (updateNotificationDto as any).read === true) {
      return this.notificationsService.markAsRead(id);
    }
    return true;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
