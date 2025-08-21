import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Patch,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/change-password';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para la autenticación del usuario.
   * Valida las credenciales mediante el AuthService y, de ser correctas, retorna un access token.
   *
   * @param loginDto Objeto que contiene las credenciales: email y password.
   * @returns Objeto con el token de acceso y la expiración del mismo.
   * @throws UnauthorizedException en caso de credenciales inválidas.
   */
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuario y obtener JWT' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Token JWT y datos básicos del usuario',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: '3600',
        user: { id: 'uuid', name: 'Nombre', email: 'mail@dominio.com', role: 'CLIENT' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    // Validamos el usuario a través del AuthService; de no ser válido se lanza la excepción correspondiente.
    console.log('loginDto', loginDto);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    console.log('user', user);
    return this.authService.login(user);
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'Cerrar sesión (stateless, lado cliente)' })
  logout() {
    return { ok: true };
  }

  /**
   * Endpoint para la renovación del token de acceso.
   * Se debe enviar un refresh token válido que permita generar un nuevo token de acceso.
   *
   * @param refreshToken El token de actualización (refresh token).
   * @returns Un nuevo access token.
   * @throws UnauthorizedException si el refresh token es inválido o no se proporciona.
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string' } },
      required: ['refreshToken'],
    },
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token es requerido');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Password changed successfully.' };
  }
}
