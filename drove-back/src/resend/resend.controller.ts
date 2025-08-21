// src/resend/resend.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ResendService } from './resend.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Email')
@Controller('email')
export class ResendController {
  constructor(private readonly resend: ResendService) {}

  /**
   * Endpoint genérico para probar el envío de correo.
   * Ejemplo JSON:
   * {
   *   "to": "destino@ejemplo.com",
   *   "subject": "Hola 👋",
   *   "html": "<strong>Mensaje</strong>"
   * }
   */
  @Post('send')
  @ApiOperation({ summary: 'Enviar email de prueba' })
  @ApiBody({ type: SendEmailDto })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto) {
    const ok = await this.resend.sendEmail({
      from: 'contacto@drove.es', // Cambia tu remitente verificado
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
    });

    return { success: ok };
  }
}
