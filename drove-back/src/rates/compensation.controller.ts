import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompensationService } from './compensation.service';

@ApiTags('Rates')
@Controller('rates/compensation')
export class CompensationController {
  constructor(private readonly svc: CompensationService) {}

  @Get('freelance')
  @ApiOperation({ summary: 'Cálculo por traslado (autónomo)' })
  @ApiQuery({ name: 'km', required: true })
  freelance(@Query('km') km: string) {
    const val = parseFloat(km);
    if (isNaN(val)) throw new BadRequestException('km inválido');
    return this.svc.calcFreelancePerTrip(val);
  }

  @Get('contracted')
  @ApiOperation({ summary: 'Cálculo mensual (contratado)' })
  @ApiQuery({ name: 'droverId', required: true })
  @ApiQuery({ name: 'month', required: true, description: 'YYYY-MM' })
  async contracted(@Query('droverId') droverId: string, @Query('month') month: string) {
    if (!/^\d{4}-\d{2}$/.test(month)) throw new BadRequestException('month debe ser YYYY-MM');
    return this.svc.calcContractedMonthlyByDrover(droverId, month);
  }

  @Get('preview')
  @ApiOperation({ summary: 'Preview por drover (auto-detecta tipo)' })
  @ApiQuery({ name: 'droverId', required: true })
  @ApiQuery({ name: 'km', required: false })
  @ApiQuery({ name: 'month', required: false })
  async preview(@Query('droverId') droverId: string, @Query('km') km?: string, @Query('month') month?: string) {
    const parsedKm = typeof km === 'string' ? parseFloat(km) : undefined;
    if (km && isNaN(parsedKm as any)) throw new BadRequestException('km inválido');
    return this.svc.previewForTravelOrMonth({ droverId, km: parsedKm, month });
  }
}


