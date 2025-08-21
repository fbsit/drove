import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import { TravelsService } from './travels.service';
import {
  CreateTravelDto,
  UpdateTravelStatusDto,
  PickupVerificationDto,
  DeliveryVerificationDto,
  UpdateTravelDto,
} from './dto/create-travel.dto';
import { Travels } from './entities/travel.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { FinishTravelDto } from './dto/finish-travel.dto';
import { RescheduleTravelDto } from './dto/reschedule-travel.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Travels')
@Controller('travels')
export class TravelsController {
  constructor(private readonly service: TravelsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un traslado' })
  @ApiBody({ type: CreateTravelDto })
  @ApiCreatedResponse({ type: Travels })
  create(
    @GetUser()
    user: {
      sub: string;
      email: string;
      name: string;
      iat: number;
      exp: number;
    },
    @Body() dto: CreateTravelDto,
  ): Promise<Travels> {
    return this.service.create(dto, user);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reprogramar traslado' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: RescheduleTravelDto })
  async reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleTravelDto,
    @Req() req: any,
  ) {
    return this.service.reschedule(id, dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar traslados' })
  @ApiOkResponse({ type: [Travels] })
  findAll(): Promise<Travels[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un traslado por ID' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: Travels })
  findOne(@Param('id') id: string): Promise<Travels> {
    return this.service.findOne(id);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Listar traslados por cliente' })
  @ApiParam({ name: 'clientId' })
  @ApiOkResponse({ type: [Travels] })
  findByClient(@Param('clientId') clientId: string): Promise<Travels[]> {
    return this.service.findByClient(clientId);
  }

  @Get('drover/:droverId')
  @ApiOperation({ summary: 'Listar traslados por drover' })
  @ApiParam({ name: 'droverId' })
  @ApiOkResponse({ type: [Travels] })
  findByDrover(@Param('droverId') droverId: string): Promise<Travels[]> {
    return this.service.findByDrover(droverId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar traslado' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTravelDto })
  @ApiOkResponse({ type: Travels })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelDto,
  ): Promise<Travels> {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del traslado' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTravelStatusDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTravelStatusDto,
  ): Promise<void> {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/verification/startTravel')
  @ApiOperation({ summary: 'Iniciar viaje' })
  @ApiParam({ name: 'id' })
  initTravel(@Param('id') id: string): Promise<void> {
    return this.service.initTravel(id);
  }

  @Patch(':id/verification/finishTravel')
  @ApiOperation({ summary: 'Finalizar viaje' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: FinishTravelDto })
  async finishTravel(@Param('id') id: string, @Body() dto: FinishTravelDto) {
    return this.service.finishTravel(id, dto);
  }

  @Post(':id/verification/pickup')
  @ApiOperation({ summary: 'Guardar verificación de recogida' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: PickupVerificationDto })
  async pickupVerification(
    @Param('id') id: string,
    @Body() dto: PickupVerificationDto,
  ): Promise<void> {
    return this.service.savePickupVerification(id, dto);
  }

  @Post(':id/verification/delivery')
  @ApiOperation({ summary: 'Guardar verificación de entrega' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: DeliveryVerificationDto })
  deliveryVerification(
    @Param('id') id: string,
    @Body() dto: DeliveryVerificationDto,
  ): Promise<void> {
    return this.service.saveDeliveryVerification(id, dto);
  }
}
