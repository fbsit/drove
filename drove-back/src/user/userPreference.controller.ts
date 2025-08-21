import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PreferenceService } from './userPreference.service';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiTags('Preferences')
@ApiBearerAuth()
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly svc: PreferenceService) {}

  /** Obtiene todas las preferencias del usuario autenticado */
  @Get()
  @ApiOperation({ summary: 'Obtener preferencias del usuario autenticado' })
  async findMine(@Req() req) {
    return this.svc.get(req.user.id);
  }

  /** Actualiza (parcialmente) las preferencias del usuario */
  @Patch()
  @ApiOperation({ summary: 'Actualizar preferencias del usuario autenticado' })
  @ApiBody({ type: UpdatePreferencesDto })
  async updateMine(@Req() req, @Body() dto: UpdatePreferencesDto) {
    return this.svc.update(req.user.id, dto);
  }
}
