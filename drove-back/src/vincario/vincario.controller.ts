import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { VincarioService, VincarioResponse } from './vincario.service';

export class DecodeVinDto {
  vin: string;
}

@ApiTags('Vincario')
@Controller('vincario')
@UseGuards(ThrottlerGuard)
export class VincarioController {
  constructor(private readonly vincarioService: VincarioService) {}

  @Post('decode')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 requests per minute
  @ApiOperation({ summary: 'Decodificar VIN usando Vincario API' })
  @ApiBody({ 
    type: DecodeVinDto,
    description: 'VIN de 17 caracteres alfanuméricos',
    examples: {
      valid: {
        summary: 'VIN válido',
        value: { vin: '1HGBH41JXMN109186' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'VIN decodificado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          make: 'Honda',
          model: 'Civic',
          year: '2021',
          vin: '1HGBH41JXMN109186'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'VIN inválido',
    schema: {
      example: {
        success: false,
        error: 'VIN inválido. Debe tener 17 caracteres alfanuméricos sin I, O, Q'
      }
    }
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes',
    schema: {
      example: {
        success: false,
        error: 'Demasiadas solicitudes. Espera 30 segundos'
      }
    }
  })
  async decodeVin(@Body() body: DecodeVinDto): Promise<VincarioResponse> {
    const { vin } = body;
    
    if (!vin || typeof vin !== 'string') {
      return {
        success: false,
        error: 'VIN es requerido'
      };
    }

    return this.vincarioService.decodeVin(vin);
  }
}
