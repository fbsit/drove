import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EmailVerificationService } from './verifications.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Verifications')
@Controller('verifications')
export class VerificationsController {
  constructor(
    private readonly verificationsService: EmailVerificationService,
  ) {}

  @Post('email/send-code')
  @ApiOperation({ summary: 'Enviar código de verificación al email' })
  @ApiBody({ schema: { properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } })
  async sendCode(@Body('email') email: string) {
    const ok = await this.verificationsService.sendVerificationCode(email);
    if (!ok) throw new BadRequestException('Email no encontrado');
    return { message: 'Código enviado' };
  }

  @Post('email/check-code')
  @ApiOperation({ summary: 'Validar código de verificación' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', format: 'email' },
        code: { type: 'string' },
      },
      required: ['email', 'code'],
    },
  })
  async checkCode(@Body('email') email: string, @Body('code') code: string) {
    const ok = await this.verificationsService.verifyCode(email, code);
    if (!ok) throw new BadRequestException('Código inválido o expirado');
    return { message: 'Email verificado' };
  }
}
