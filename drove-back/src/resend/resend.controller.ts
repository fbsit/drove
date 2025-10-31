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

  @Post('test-config')
  @ApiOperation({ summary: 'Probar configuración de Resend' })
  @ApiOkResponse({ schema: { example: { success: true, message: 'Configuración verificada' } } })
  @HttpCode(HttpStatus.OK)
  async testConfig() {
    const success = await this.resend.testResendConfiguration();
    return { 
      success, 
      message: success ? 'Configuración de Resend verificada correctamente' : 'Error en la configuración de Resend'
    };
  }

  @Post('test-transfer-creation-email')
  @ApiOperation({ summary: 'Probar envío de correo de creación de traslado' })
  @ApiOkResponse({ schema: { example: { success: true, message: 'Correo enviado' } } })
  @HttpCode(HttpStatus.OK)
  async testTransferCreationEmail(@Body() body: { email: string; name: string }) {
    try {
      const result = await this.resend.sendTransferRequestCreatedEmail(
        body.email,
        body.name,
        'Toyota Corolla - ABC123',
        new Date().toLocaleDateString('es-ES'),
        'Madrid',
        'Barcelona',
        'https://drove.es/cliente/traslados/test-123'
      );
      
      return { 
        success: true, 
        message: 'Correo de creación de traslado enviado correctamente',
        result
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error enviando correo de creación de traslado',
        error: error.message
      };
    }
  }
}
