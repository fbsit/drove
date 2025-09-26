import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CarDataService } from './cardata.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('car-data')
@UseGuards(ThrottlerGuard)
export class CarDataController {
  constructor(private readonly service: CarDataService) {}

  // Catálogo: marcas
  @Get('makes')
  @Throttle({ default: { limit: 120, ttl: 60 } })
  async getMakes(@Query('year') year?: string) {
    const y = year ? parseInt(year, 10) : undefined;
    return this.service.getMakes(y);
  }

  // Catálogo: modelos
  @Get('models')
  @Throttle({ default: { limit: 120, ttl: 60 } })
  async getModels(@Query('make') make: string, @Query('year') year?: string) {
    const y = year ? parseInt(year, 10) : undefined;
    return this.service.getModels(make, y);
  }

  // Catálogo: versiones (trims)
  @Get('trims')
  @Throttle({ default: { limit: 120, ttl: 60 } })
  async getTrims(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year') year?: string,
    @Query('all') all?: string,
  ) {
    const y = year ? parseInt(year, 10) : undefined;
    const a = all === 'yes' || all === 'true';
    return this.service.getTrims(make, model, y, a);
  }

  // VIN decode
  @Get('vin/:vin')
  @Throttle({ default: { limit: 60, ttl: 60 } })
  async decodeVin(
    @Param('vin') vin: string,
    @Query('verbose') verbose?: string,
    @Query('all_trims') allTrims?: string,
  ) {
    const v = (verbose === 'yes' || verbose === 'true');
    const a = (allTrims === 'yes' || allTrims === 'true');
    return this.service.decodeVin(vin, v, a);
  }
}


