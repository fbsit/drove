// src/routes/routes.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post('compute')
  @ApiOperation({ summary: 'Calcular rutas' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  async computeRoutes(@Body() body: any): Promise<any> {
    // Llama al servicio para obtener las rutas según el objeto recibido
    return this.routesService.getRoutes(body);
  }

  @Get('distance')
  @ApiOperation({ summary: 'Calcular distancia' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getDistance(@Query() query: any): Promise<any> {
    // Llama al servicio para obtener la distancia utilizando los parámetros de consulta
    return this.routesService.getDistance(query);
  }
}
